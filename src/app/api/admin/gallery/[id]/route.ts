import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * PATCH (admin only): update a gallery image.
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

    if ("title" in b) data.title = String(b.title || "Untitled image");
    if ("imageUrl" in b) data.imageUrl = String(b.imageUrl || "");
    if ("caption" in b)
      data.caption = b.caption == null ? null : String(b.caption);
    if ("sortOrder" in b && b.sortOrder !== null && b.sortOrder !== undefined)
      data.sortOrder = Number(b.sortOrder);
    if ("isActive" in b) data.isActive = Boolean(b.isActive);

    const image = await db.galleryImage.update({ where: { id }, data });
    return NextResponse.json({ ok: true, image });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE (admin only): remove a gallery image.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.galleryImage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
