import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await db.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json({ settings: map });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { settings } = (await req.json()) as { settings: Record<string, string> };
    for (const [key, value] of Object.entries(settings)) {
      const existing = await db.setting.findFirst({ where: { key } });
      if (existing) {
        await db.setting.update({ where: { id: existing.id }, data: { value } });
      } else {
        await db.setting.create({ data: { key, value } });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
