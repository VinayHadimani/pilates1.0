import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

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
    if ("status" in b) data.status = String(b.status);
    if ("notes" in b) data.notes = b.notes == null ? null : String(b.notes);
    if ("date" in b) data.date = b.date == null ? null : String(b.date);
    if ("slotLabel" in b)
      data.slotLabel = b.slotLabel == null ? null : String(b.slotLabel);
    const booking = await db.booking.update({ where: { id }, data });
    return NextResponse.json({ ok: true, booking });
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
    await db.booking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
