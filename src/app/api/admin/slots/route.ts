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
  const slots = await db.classSlot.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json({ slots });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = (await req.json()) as any;
    const trainerId =
      b.trainerId === null || b.trainerId === "" ? null : String(b.trainerId);
    const slot = await db.classSlot.create({
      data: {
        dayOfWeek: num(b.dayOfWeek),
        startTime: String(b.startTime || "07:00"),
        endTime: b.endTime ? String(b.endTime) : null,
        className: String(b.className || "Reformer Pilates"),
        capacity: num(b.capacity, 6),
        isActive: b.isActive !== false,
        sortOrder: num(b.sortOrder, 99),
        trainerId,
      },
    });
    return NextResponse.json({ ok: true, slot });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
