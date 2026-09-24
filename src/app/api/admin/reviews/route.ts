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

/**
 * GET (admin only): list all reviews, newest first.
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const reviews = await db.review.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ reviews });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * POST (admin only): create a review manually.
 * Used for adding existing Google reviews to the public wall.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const b = (await req.json()) as {
      name?: string;
      rating?: number;
      title?: string;
      body?: string;
      source?: string;
      googleUrl?: string;
      status?: string;
    };
    const name = clean(b.name, 120);
    const body = clean(b.body, 2000);
    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }
    if (!body) {
      return NextResponse.json(
        { error: "body is required" },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        name,
        rating: clampInt(b.rating, 5),
        title: clean(b.title, 200) || null,
        body,
        source: b.source === "google" ? "google" : "user",
        googleUrl: b.googleUrl ? clean(b.googleUrl, 1000) : null,
        status: b.status === "approved" ? "approved" : "pending",
        isActive: true,
        sortOrder: 0,
      },
    });
    await logAction(
      undefined,
      undefined,
      "review.create",
      `name=${review.name} source=${review.source} status=${review.status}`
    );
    return NextResponse.json({ ok: true, review });
  } catch (e: any) {
    console.error("admin reviews POST error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
