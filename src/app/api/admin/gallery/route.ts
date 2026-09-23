import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET (admin only): list all gallery images (active + inactive).
 */
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const images = await db.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ images });
}

/**
 * POST (admin only): create a new gallery image.
 * Accepts { title, imageUrl, caption, sortOrder, isActive }
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = (await req.json()) as any;
    const title = String(b.title || "Untitled image").trim();
    const imageUrl = String(b.imageUrl || "").trim();
    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const data = {
      title,
      imageUrl,
      caption: b.caption ? String(b.caption) : null,
      sortOrder:
        b.sortOrder !== undefined && b.sortOrder !== null
          ? Number(b.sortOrder)
          : 0,
      isActive: b.isActive === undefined ? true : Boolean(b.isActive),
    };

    const image = await db.galleryImage.create({ data });
    return NextResponse.json({ ok: true, image });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
