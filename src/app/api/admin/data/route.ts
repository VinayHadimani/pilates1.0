import { NextResponse } from "next/server";
import { db } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = (day + 6) % 7;
  x.setDate(x.getDate() - diff);
  return x;
}

/** Compute analytics inline so the dashboard can render them in one request. */
async function computeAnalytics(now: Date) {
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

  return {
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
  };
}

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  const [
    plans,
    bookings,
    slots,
    memberships,
    settingsRows,
    certificates,
    trainers,
    payments,
    auditLogs,
    blogPosts,
    analytics,
  ] = await Promise.all([
    db.pricingPlan.findMany({ orderBy: [{ sortOrder: "asc" }, { price: "asc" }] }),
    db.booking.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    db.classSlot.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
    }),
    db.membership.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    db.setting.findMany(),
    db.certificate.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.trainer.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.blogPost.findMany({
      orderBy: [{ createdAt: "desc" }],
    }),
    computeAnalytics(now),
  ]);

  const settings: Record<string, string> = {};
  for (const r of settingsRows) settings[r.key] = r.value;

  return NextResponse.json({
    plans,
    bookings,
    slots,
    memberships,
    settings,
    certificates,
    trainers,
    payments,
    auditLogs,
    blogPosts,
    analytics,
  });
}
