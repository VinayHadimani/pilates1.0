import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

interface CreateBody {
  type: "trial" | "daily" | "membership";
  name: string;
  phone: string;
  email?: string;
  goal?: string;
  planId?: string;
  slotId?: string;
  date?: string; // yyyy-MM-dd
  slotLabel?: string;
  // membership-specific: chosen recurring weekly slots
  lockedSlots?: { dayOfWeek: number; time: string; label: string }[];
  notes?: string;
}

function clean(v: unknown, max = 200): string {
  if (!v) return "";
  return String(v).slice(0, max).trim();
}

function isValidDate(s?: string): boolean {
  if (!s) return false;
  const d = new Date(s + "T00:00:00");
  return !isNaN(d.getTime());
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBody;
    const type = body.type;

    if (!["trial", "daily", "membership"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid booking type" },
        { status: 400 }
      );
    }
    const name = clean(body.name);
    const phone = clean(body.phone, 40);
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // ---- TRIAL ----
    if (type === "trial") {
      const booking = await db.booking.create({
        data: {
          type: "trial",
          name,
          phone,
          email: clean(body.email),
          goal: clean(body.goal, 300),
          status: "pending",
          notes: clean(body.notes),
        },
      });
      return NextResponse.json({ ok: true, booking });
    }

    // ---- DAILY ----
    if (type === "daily") {
      if (!isValidDate(body.date)) {
        return NextResponse.json({ error: "A valid date is required" }, { status: 400 });
      }
      if (!body.slotLabel) {
        return NextResponse.json({ error: "Please pick a class slot" }, { status: 400 });
      }
      // capacity check
      const slot = body.slotId
        ? await db.classSlot.findUnique({ where: { id: body.slotId } })
        : null;
      const capacity = slot?.capacity ?? 6;

      const sameSlotCount = await db.booking.count({
        where: {
          type: "daily",
          date: body.date,
          slotLabel: body.slotLabel,
          status: { in: ["confirmed", "pending", "rescheduled"] },
        },
      });
      // also count memberships locking this weekday+time
      const weekday = new Date(body.date + "T00:00:00").getDay();
      const memberships = await db.membership.findMany({
        where: { status: "active" },
      });
      let locked = 0;
      for (const m of memberships) {
        try {
          const arr = JSON.parse(m.lockedDates || "[]") as {
            dayOfWeek: number;
            time: string;
            label: string;
          }[];
          if (arr.some((s) => s.dayOfWeek === weekday && s.label === body.slotLabel)) {
            locked++;
          }
        } catch {}
      }

      if (sameSlotCount + locked >= capacity) {
        return NextResponse.json(
          { error: "This slot is fully booked. Please choose another slot." },
          { status: 409 }
        );
      }

      const booking = await db.booking.create({
        data: {
          type: "daily",
          name,
          phone,
          email: clean(body.email),
          slotId: clean(body.slotId),
          date: body.date!,
          slotLabel: body.slotLabel,
          status: "confirmed",
          notes: clean(body.notes),
        },
      });
      return NextResponse.json({ ok: true, booking });
    }

    // ---- MEMBERSHIP ----
    if (type === "membership") {
      const plan = body.planId
        ? await db.pricingPlan.findUnique({ where: { id: body.planId } })
        : null;
      if (!plan || plan.type !== "membership" || !plan.isActive) {
        return NextResponse.json({ error: "Invalid membership plan" }, { status: 400 });
      }
      // lockedSlots is now OPTIONAL — slot locking happens after payment
      // (the next step). If provided, store them; if not, empty array.
      const locked = (body.lockedSlots || []).filter(
        (s) => s && s.dayOfWeek != null && s.time
      );

      const start = new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + plan.durationMonths);

      const booking = await db.booking.create({
        data: {
          type: "membership",
          name,
          phone,
          email: clean(body.email),
          planId: plan.id,
          status: "pending", // pending until payment + slot selection
          notes: clean(body.notes),
        },
      });

      const membership = await db.membership.create({
        data: {
          name,
          phone,
          email: clean(body.email),
          planId: plan.id,
          planName: plan.name,
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          classesPerWeek: plan.classesPerWeek,
          totalClasses: plan.totalClasses,
          usedClasses: 0,
          bonusClasses: plan.bonusClasses,
          carryForward: plan.carryForward,
          lockedDates: JSON.stringify(locked),
          status: "active",
          bookingId: booking.id,
        },
      });

      return NextResponse.json({ ok: true, booking, membership });
    }

    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  } catch (e: any) {
    console.error("booking create error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const q = searchParams.get("q") || undefined;

  const where: any = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ bookings });
}
