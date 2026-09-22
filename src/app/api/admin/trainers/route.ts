import { NextRequest, NextResponse } from "next/server";
import { db, logAction } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function num(v: unknown, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

/**
 * GET (admin only): list all trainers.
 */
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trainers = await db.trainer.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ trainers });
}

/**
 * POST (admin only): create a trainer.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = (await req.json()) as any;
    const trainer = await db.trainer.create({
      data: {
        name: String(b.name || "Untitled trainer"),
        title: String(b.title || ""),
        bio: b.bio ? String(b.bio) : null,
        imageUrl: b.imageUrl ? String(b.imageUrl) : null,
        specialities: b.specialities ? String(b.specialities) : null,
        sortOrder: num(b.sortOrder, 99),
        isActive: b.isActive !== false,
      },
    });
    await logAction(
      undefined,
      undefined,
      "trainer.create",
      `name=${trainer.name}`
    );
    return NextResponse.json({ ok: true, trainer });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
