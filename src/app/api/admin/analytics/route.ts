import { NextResponse } from "next/server";
import { db } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Start of the current week (Monday). */
function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 Sun ... 6 Sat
  const diff = (day + 6) % 7; // days since Monday
  x.setDate(x.getDate() - diff);
  return x;
}

/**
 * GET (admin only): return aggregate analytics.
 */
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);

  const [
    totalMembers,
    activeMemberships,
    totalBookings,
    todayBookings,
    thisWeekBookings,
    totalRevenueAgg,
    trialBookings,
    membershipsForPhones,
    totalSlotsAgg,
    slotsCapacityAgg,
  ] = await Promise.all([
    db.user.count({ where: { role: "member" } }),
    db.membership.count({ where: { status: "active" } }),
    db.booking.count(),
    db.booking.count({ where: { createdAt: { gte: todayStart } } }),
    db.booking.count({ where: { createdAt: { gte: weekStart } } }),
    db.payment.aggregate({
      where: { status: "success" },
      _sum: { amount: true },
    }),
    db.booking.findMany({
      where: { type: "trial" },
      select: { id: true, phone: true, status: true },
    }),
    db.membership.findMany({ select: { phone: true } }),
    db.classSlot.count(),
    db.classSlot.aggregate({ _sum: { capacity: true } }),
  ]);

  const trialCount = trialBookings.length;
  const membershipPhones = new Set(
    membershipsForPhones
      .map((m) => m.phone?.trim())
      .filter((p): p is string => !!p && p.length > 0)
  );

  // Converted = trial booking that is confirmed OR whose phone reappears in a membership.
  const convertedTrials = trialBookings.filter(
    (b) => b.status === "confirmed" || membershipPhones.has((b.phone || "").trim())
  ).length;

  const conversionRate =
    trialCount > 0 ? Math.round((convertedTrials / trialCount) * 1000) / 10 : 0;

  const totalRevenue = totalRevenueAgg._sum.amount || 0;
  const slotCapacity = slotsCapacityAgg._sum.capacity || 0;
  const slotUtilization =
    slotCapacity > 0
      ? Math.round((totalBookings / (totalSlotsAgg * slotCapacity)) * 1000) / 10
      : 0;

  return NextResponse.json({
    totalMembers,
    activeMemberships,
    totalBookings,
    todayBookings,
    thisWeekBookings,
    totalRevenue,
    trialCount,
    convertedTrials,
    conversionRate,
    slotUtilization,
    totalSlots: totalSlotsAgg,
    slotCapacity,
  });
}
