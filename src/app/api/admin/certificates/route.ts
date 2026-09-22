import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function num(v: unknown, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const certificates = await db.certificate.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ certificates });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = (await req.json()) as any;
    const cert = await db.certificate.create({
      data: {
        title: String(b.title || "Untitled certificate"),
        issuer: String(b.issuer || ""),
        year: String(b.year || ""),
        description: b.description ? String(b.description) : null,
        imageUrl: b.imageUrl ? String(b.imageUrl) : null,
        isActive: b.isActive !== false,
        sortOrder: num(b.sortOrder, 99),
      },
    });
    return NextResponse.json({ ok: true, certificate: cert });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
