import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

/**
 * POST (admin only): upload an image file.
 * Accepts multipart/form-data with a "file" field.
 * Saves to public/images/uploads/ and returns { ok, url }.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Use a 'file' field in multipart/form-data." },
        { status: 400 }
      );
    }

    // Basic size/type guard (10 MB cap, image/* only).
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)." },
        { status: 413 }
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are accepted." },
        { status: 415 }
      );
    }

    // Build a unique filename — keep the original extension if present.
    const ext = path.extname(file.name || "").toLowerCase() || ".jpg";
    const safeExt = /^[a-z0-9]+$/.test(ext.slice(1)) ? ext : ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;

    const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(path.join(uploadsDir, filename), buffer);

    const url = `/images/uploads/${filename}`;
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
