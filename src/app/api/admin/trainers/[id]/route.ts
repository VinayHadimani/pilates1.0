import { NextRequest, NextResponse } from "next/server";
import { db, logAction } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function num(v: unknown, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

/**
 * PATCH (admin only): update a trainer.
 */
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
    for (const k of ["name", "title", "bio", "imageUrl", "specialities"]) {
      if (k in b) data[k] = b[k] == null ? null : String(b[k]);
    }
    if ("sortOrder" in b) data.sortOrder = num(b.sortOrder);
    if ("isActive" in b) data.isActive = !!b.isActive;

    const trainer = await db.trainer.update({ where: { id }, data });
    await logAction(undefined, undefined, "trainer.update", `id=${id}`);
    return NextResponse.json({ ok: true, trainer });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE (admin only): remove a trainer.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.trainer.delete({ where: { id } });
    await logAction(undefined, undefined, "trainer.delete", `id=${id}`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
