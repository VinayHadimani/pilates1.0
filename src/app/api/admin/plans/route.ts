import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function num(v: unknown, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plans = await db.pricingPlan.findMany({
    orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
  });
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = (await req.json()) as any;
    const plan = await db.pricingPlan.create({
      data: {
        name: String(b.name || "Untitled plan"),
        type: String(b.type || "membership"),
        durationMonths: num(b.durationMonths),
        frequency: String(b.frequency || ""),
        classesPerWeek: num(b.classesPerWeek),
        totalClasses: num(b.totalClasses),
        bonusClasses: num(b.bonusClasses),
        carryForward: num(b.carryForward),
        price: num(b.price),
        currency: String(b.currency || "INR"),
        oldPrice: b.oldPrice ? num(b.oldPrice) : null,
        tagline: b.tagline ? String(b.tagline) : null,
        features: b.features ? String(b.features) : null,
        isActive: b.isActive !== false,
        isFeatured: b.isFeatured === true,
        sortOrder: num(b.sortOrder, 99),
      },
    });
    return NextResponse.json({ ok: true, plan });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
