import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [plans, bookings, slots, memberships, settingsRows, certificates] = await Promise.all([
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
  });
}
