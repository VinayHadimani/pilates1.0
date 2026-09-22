import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export const runtime = "nodejs";

interface RenewBody {
  membershipId?: string;
  additionalMonths?: number;
  additionalCredits?: number;
}

function clampInt(v: unknown, fallback = 0): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as RenewBody;
    const membershipId = (body.membershipId || "").trim();
    if (!membershipId) {
      return NextResponse.json(
        { error: "membershipId is required" },
        { status: 400 }
      );
    }
    const additionalMonths = Math.max(0, clampInt(body.additionalMonths, 0));
    const additionalCredits = Math.max(0, clampInt(body.additionalCredits, 0));

    if (additionalMonths === 0 && additionalCredits === 0) {
      return NextResponse.json(
        { error: "Provide additionalMonths or additionalCredits greater than 0" },
        { status: 400 }
      );
    }

    const existing = await db.membership.findUnique({
      where: { id: membershipId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Extend endDate by additionalMonths (parses "yyyy-MM-dd" safely).
    const end = new Date(existing.endDate + "T00:00:00");
    if (isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Membership has an invalid endDate" },
        { status: 400 }
      );
    }
    if (additionalMonths > 0) {
      end.setMonth(end.getMonth() + additionalMonths);
    }
    const newEndDate = end.toISOString().slice(0, 10);

    // Add additionalCredits to totalClasses.
    const newTotalClasses = existing.totalClasses + additionalCredits;

    const membership = await db.membership.update({
      where: { id: membershipId },
      data: {
        endDate: newEndDate,
        totalClasses: newTotalClasses,
        // Renewing implicitly re-activates an expired membership.
        status: existing.status === "expired" ? "active" : existing.status,
      },
    });

    await logAction(
      undefined,
      undefined,
      "membership.renew",
      `id=${membershipId} +${additionalMonths}mo +${additionalCredits}cr → end=${newEndDate} total=${newTotalClasses}`
    );

    return NextResponse.json({ ok: true, membership });
  } catch (e: any) {
    console.error("membership renew error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
