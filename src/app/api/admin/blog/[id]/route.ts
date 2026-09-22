import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * PATCH (admin only): update a blog post.
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

    if ("title" in b) data.title = String(b.title || "Untitled post");
    if ("slug" in b) {
      let slug = String(b.slug || "").trim();
      if (!slug) {
        slug = (b.title || data.title || "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      }
      if (!slug) slug = `post-${Date.now()}`;
      data.slug = slug;
    }
    if ("excerpt" in b) data.excerpt = b.excerpt == null ? null : String(b.excerpt);
    if ("content" in b) data.content = b.content == null ? null : String(b.content);
    if ("imageUrl" in b) data.imageUrl = b.imageUrl == null ? null : String(b.imageUrl);
    if ("author" in b) data.author = String(b.author || "Arcwave Pilates");

    if ("status" in b) {
      const status = b.status === "published" ? "published" : "draft";
      data.status = status;
      // If switching to published and no publishedAt set, stamp it now.
      if (status === "published") {
        const existing = await db.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
        if (!existing?.publishedAt) {
          data.publishedAt = new Date();
        }
      }
    }

    if ("publishedAt" in b && b.publishedAt) {
      data.publishedAt = new Date(b.publishedAt);
    }

    const post = await db.blogPost.update({ where: { id }, data });
    return NextResponse.json({ ok: true, post });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE (admin only): remove a blog post.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
