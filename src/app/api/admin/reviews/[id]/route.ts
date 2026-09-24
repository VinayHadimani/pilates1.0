import { NextRequest, NextResponse } from "next/server";
import { db, logAction } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function clean(v: unknown, max = 500): string {
  if (!v) return "";
  return String(v).slice(0, max).trim();
}

function clampInt(v: unknown, fallback = 5): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(5, Math.trunc(n)));
}

const ALLOWED_STATUSES = new Set(["pending", "approved", "rejected"]);

/**
 * PATCH (admin only): update a review's status or content.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const b = (await req.json()) as {
      name?: string;
      rating?: number;
      title?: string;
      body?: string;
      status?: string;
      source?: string;
      googleUrl?: string;
      isActive?: boolean;
      sortOrder?: number;
    };
    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const data: any = {};
    if ("name" in b) data.name = clean(b.name, 120) || existing.name;
    if ("body" in b) data.body = clean(b.body, 2000) || existing.body;
    if ("title" in b) data.title = b.title == null ? null : clean(b.title, 200);
    if ("rating" in b) data.rating = clampInt(b.rating, existing.rating);
    if ("source" in b)
      data.source = b.source === "google" ? "google" : "user";
    if ("googleUrl" in b)
      data.googleUrl = b.googleUrl == null ? null : clean(b.googleUrl, 1000);
    if ("status" in b && ALLOWED_STATUSES.has(String(b.status)))
      data.status = String(b.status);
    if ("isActive" in b) data.isActive = !!b.isActive;
    if ("sortOrder" in b) data.sortOrder = Number(b.sortOrder) || 0;

    const review = await db.review.update({ where: { id }, data });
    await logAction(
      undefined,
      undefined,
      "review.update",
      `id=${id} status=${review.status}`
    );
    return NextResponse.json({ ok: true, review });
  } catch (e: any) {
    console.error("admin reviews PATCH error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE (admin only): permanently remove a review.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    await db.review.delete({ where: { id } });
    await logAction(
      undefined,
      undefined,
      "review.delete",
      `id=${id} name=${existing.name}`
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
