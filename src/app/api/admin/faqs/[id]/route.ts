import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * PATCH (admin only): update a FAQ entry.
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

    if ("question" in b) data.question = String(b.question || "");
    if ("answer" in b) data.answer = String(b.answer || "");
    if ("sortOrder" in b && b.sortOrder !== null && b.sortOrder !== undefined)
      data.sortOrder = Number(b.sortOrder);
    if ("isActive" in b) data.isActive = Boolean(b.isActive);

    const faq = await db.faqEntry.update({ where: { id }, data });
    return NextResponse.json({ ok: true, faq });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE (admin only): remove a FAQ entry.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.faqEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
