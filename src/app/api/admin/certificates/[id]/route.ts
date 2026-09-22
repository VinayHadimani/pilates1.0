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
    if ("title" in b) data.title = String(b.title);
    if ("issuer" in b) data.issuer = String(b.issuer);
    if ("year" in b) data.year = String(b.year);
    if ("description" in b) data.description = b.description == null ? null : String(b.description);
    if ("imageUrl" in b) data.imageUrl = b.imageUrl == null ? null : String(b.imageUrl);
    if ("isActive" in b) data.isActive = !!b.isActive;
    if ("sortOrder" in b) data.sortOrder = num(b.sortOrder);
    const cert = await db.certificate.update({ where: { id }, data });
    return NextResponse.json({ ok: true, certificate: cert });
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
    await db.certificate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
