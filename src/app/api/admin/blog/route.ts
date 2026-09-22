import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET (admin only): list all blog posts (drafts + published).
 */
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const posts = await db.blogPost.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json({ posts });
}

/**
 * POST (admin only): create a new blog post.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = (await req.json()) as any;
    const title = String(b.title || "Untitled post").trim();
    let slug = String(b.slug || "").trim();
    if (!slug) {
      slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }
    if (!slug) slug = `post-${Date.now()}`;

    const status = b.status === "published" ? "published" : "draft";
    const publishedAt =
      status === "published" ? (b.publishedAt ? new Date(b.publishedAt) : new Date()) : null;

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        excerpt: b.excerpt ? String(b.excerpt) : null,
        content: b.content ? String(b.content) : null,
        imageUrl: b.imageUrl ? String(b.imageUrl) : null,
        status,
        author: b.author ? String(b.author) : "Arcwave Pilates",
        publishedAt,
      },
    });
    return NextResponse.json({ ok: true, post });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
