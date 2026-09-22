import { NextRequest, NextResponse } from "next/server";
import { db, logAction, getAdminActor } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Add `months` months to a YYYY-MM-DD date string and return the new
 * YYYY-MM-DD string. We use UTC setters so the result is stable regardless
 * of the server's local timezone.
 */
function addMonthsToDateString(dateStr: string, months: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  if (isNaN(d.getTime())) {
    // Fallback: today + months
    const now = new Date();
    now.setUTCMonth(now.getUTCMonth() + months);
    return now.toISOString().slice(0, 10);
  }
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * POST (admin only): manually create a Membership record from the admin
 * dashboard. Useful for offline sales / walk-ins that never went through
 * the public checkout flow.
 *
 * Body: {
 *   name:      string,         // member name
 *   phone:     string,         // member phone (required)
 *   email?:    string | null,
 *   planId:    string,         // existing PricingPlan id
 *   startDate?: string,       // YYYY-MM-DD (defaults to today)
 * }
 *
 * The Membership is created with status="active" and endDate calculated
 * from the plan's durationMonths. The action is recorded in the audit log.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const b = (await req.json()) as {
      name?: string;
      phone?: string;
      email?: string | null;
      planId?: string;
      startDate?: string;
    };

    const name = (b.name || "").trim();
    const phone = (b.phone || "").trim();
    const planId = (b.planId || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Member name is required" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Member phone is required" }, { status: 400 });
    }
    if (!planId) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    const plan = await db.pricingPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Selected plan not found" }, { status: 404 });
    }

    const startDate = (b.startDate || "").trim() || todayDateString();
    const durationMonths = Number(plan.durationMonths) || 0;
    const endDate = addMonthsToDateString(startDate, durationMonths);

    // Optional: link to an existing User account by phone (best-effort).
    let userId: string | null = null;
    try {
      const existing = await db.user.findUnique({ where: { phone } });
      if (existing) userId = existing.id;
    } catch {
      // ignore — memberships can exist without a linked user
    }

    const membership = await db.membership.create({
      data: {
        name,
        phone,
        email: b.email ? String(b.email).trim() : null,
        userId,
        planId: plan.id,
        planName: plan.name,
        startDate,
        endDate,
        classesPerWeek: Number(plan.classesPerWeek) || 0,
        totalClasses: Number(plan.totalClasses) || 0,
        usedClasses: 0,
        bonusClasses: Number(plan.bonusClasses) || 0,
        carryForward: Number(plan.carryForward) || 0,
        lockedDates: "[]",
        status: "active",
        notes: "Created manually from admin",
      },
    });

    const actor = await getAdminActor();
    await logAction(
      actor.id,
      actor.name,
      "membership.create_manual",
      `member=${name} phone=${phone} plan=${plan.name} (${plan.id}) start=${startDate} end=${endDate}`
    );

    return NextResponse.json({ ok: true, membership });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
