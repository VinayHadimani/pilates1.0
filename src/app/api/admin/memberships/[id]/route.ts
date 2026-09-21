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
    if ("usedClasses" in b) data.usedClasses = Number(b.usedClasses) || 0;
    if ("lockedDates" in b) data.lockedDates = String(b.lockedDates);
    if ("notes" in b) data.notes = b.notes == null ? null : String(b.notes);
    const m = await db.membership.update({ where: { id }, data });
    return NextResponse.json({ ok: true, membership: m });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
