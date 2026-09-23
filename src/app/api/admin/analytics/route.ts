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

/** Format a Date as "YYYY-MM". */
function monthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Build the last 6 month keys ending at the current month, oldest first.
 */
function lastSixMonthKeys(now: Date): string[] {
  const keys: string[] = [];
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base);
    d.setUTCMonth(d.getUTCMonth() - i);
    keys.push(monthKey(d));
  }
  return keys;
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

  // Six months ago, start of month — used to bound the revenue-by-month query.
  const sixMonthsAgo = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
  );

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
    successPayments,
    allMembershipsForStatus,
    allPlans,
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
    db.payment.findMany({
      where: { status: "success", createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, planId: true, createdAt: true },
    }),
    // Memberships used for user-status breakdown (need userId + status).
    db.membership.findMany({
      select: { userId: true, status: true },
    }),
    db.pricingPlan.findMany({ select: { id: true, name: true } }),
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

  /* ---------- Feature 1: Revenue by month (last 6 months) ---------- */
  const monthKeys = lastSixMonthKeys(now);
  const monthBuckets: Record<string, number> = {};
  for (const k of monthKeys) monthBuckets[k] = 0;
  for (const p of successPayments) {
    const key = monthKey(new Date(p.createdAt));
    if (key in monthBuckets) {
      monthBuckets[key] += Number(p.amount) || 0;
    }
  }
  const revenueByMonth = monthKeys.map((month) => ({
    month,
    revenue: Math.round(monthBuckets[month] * 100) / 100,
  }));

  /* ---------- Feature 1: Revenue by plan ---------- */
  // Map planId -> name (plans without a matching PricingPlan are bucketed under "Other").
  const planNameById = new Map<string, string>();
  for (const p of allPlans) planNameById.set(p.id, p.name);
  const planAgg: Record<
    string,
    { planName: string; revenue: number; count: number }
  > = {};
  for (const p of successPayments) {
    const pid = p.planId || "";
    const planName = pid ? planNameById.get(pid) || "Other" : "Other";
    if (!planAgg[pid || "__none__"]) {
      planAgg[pid || "__none__"] = { planName, revenue: 0, count: 0 };
    }
    planAgg[pid || "__none__"].revenue += Number(p.amount) || 0;
    planAgg[pid || "__none__"].count += 1;
  }
  const revenueByPlan = Object.values(planAgg)
    .map((r) => ({
      planName: r.planName,
      revenue: Math.round(r.revenue * 100) / 100,
      count: r.count,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  /* ---------- Feature 2: Member status breakdown ---------- */
  // active  = User that has at least one Membership with status="active"
  // expired = User that has at least one Membership with status="expired" (and none active)
  // inactive = User that has no Membership at all
  const usersWithActive = new Set<string>();
  const usersWithExpired = new Set<string>();
  for (const m of allMembershipsForStatus) {
    if (!m.userId) continue;
    if (m.status === "active") usersWithActive.add(m.userId);
    if (m.status === "expired") usersWithExpired.add(m.userId);
  }
  // Users with expired but no active membership.
  for (const id of usersWithActive) usersWithExpired.delete(id);
  const activeCount = usersWithActive.size;
  const expiredCount = usersWithExpired.size;
  const inactiveCount = Math.max(0, totalMembers - activeCount - expiredCount);

  const memberStatusBreakdown = {
    active: activeCount,
    inactive: inactiveCount,
    expired: expiredCount,
  };

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
    revenueByMonth,
    revenueByPlan,
    memberStatusBreakdown,
  });
}
