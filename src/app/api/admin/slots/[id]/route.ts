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
    if ("dayOfWeek" in b) data.dayOfWeek = num(b.dayOfWeek);
    if ("startTime" in b) data.startTime = String(b.startTime);
    if ("endTime" in b) data.endTime = b.endTime == null ? null : String(b.endTime);
    if ("className" in b) data.className = String(b.className);
    if ("capacity" in b) data.capacity = num(b.capacity, 6);
    if ("isActive" in b) data.isActive = !!b.isActive;
    if ("sortOrder" in b) data.sortOrder = num(b.sortOrder);
    const slot = await db.classSlot.update({ where: { id }, data });
    return NextResponse.json({ ok: true, slot });
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
    await db.classSlot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
