import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function num(v: unknown, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const b = (await req.json()) as any;
    const data: any = {};
    for (const k of [
      "name",
      "type",
      "frequency",
      "currency",
      "tagline",
      "features",
    ]) {
      if (k in b) data[k] = b[k] == null ? null : String(b[k]);
    }
    for (const k of [
      "durationMonths",
      "classesPerWeek",
      "totalClasses",
      "bonusClasses",
      "carryForward",
      "price",
      "sortOrder",
    ]) {
      if (k in b) data[k] = num(b[k]);
    }
    if ("oldPrice" in b) data.oldPrice = b.oldPrice == null ? null : num(b.oldPrice);
    if ("isActive" in b) data.isActive = !!b.isActive;
    if ("isFeatured" in b) data.isFeatured = !!b.isFeatured;

    const plan = await db.pricingPlan.update({ where: { id }, data });
    return NextResponse.json({ ok: true, plan });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await db.pricingPlan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
