import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";

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
 * POST /api/reviews
 *
 * Public submission of a new review. Always created with status="pending"
 * and source="user" so an admin can moderate before it appears on the
 * public site.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      rating?: number;
      title?: string;
      body?: string;
    };

    const name = clean(body.name, 120);
    if (!name) {
      return NextResponse.json(
        { error: "Your name is required" },
        { status: 400 }
      );
    }
    const text = clean(body.body, 2000);
    if (!text) {
      return NextResponse.json(
        { error: "Please write your review" },
        { status: 400 }
      );
    }

    const rating = clampInt(body.rating, 5);
    const title = clean(body.title, 200) || null;

    // Optional: link to the logged-in user if they happen to be a member.
    const userId = await getUserId().catch(() => null);

    await db.review.create({
      data: {
        name,
        rating,
        title,
        body: text,
        status: "pending",
        source: "user",
        userId: userId || null,
        isActive: true,
        sortOrder: 0,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Thank you! Your review is pending approval.",
    });
  } catch (e: any) {
    console.error("reviews POST error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews
 *
 * Public read of approved, active reviews for display on the home page.
 */
export async function GET() {
  try {
    const reviews = await db.review.findMany({
      where: { status: "approved", isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 50,
    });
    return NextResponse.json({ reviews });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
