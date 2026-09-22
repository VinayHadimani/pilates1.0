import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

interface WaitlistBody {
  slotId?: string;
  slotLabel?: string;
  date?: string;
  name?: string;
  phone?: string;
  email?: string;
  userId?: string;
}

function clean(v: unknown, max = 200): string {
  if (!v) return "";
  return String(v).slice(0, max).trim();
}

function isValidDate(s?: string): boolean {
  if (!s) return false;
  const d = new Date(s + "T00:00:00");
  return !isNaN(d.getTime());
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WaitlistBody;

    const slotId = clean(body.slotId, 100);
    const slotLabel = clean(body.slotLabel, 200);
    const date = clean(body.date, 20);
    const name = clean(body.name, 120);
    const phone = clean(body.phone, 40);
    const email = clean(body.email, 200);
    const userId = clean(body.userId, 100) || null;

    if (!slotId) {
      return NextResponse.json(
        { error: "A slot is required to join the waitlist" },
        { status: 400 }
      );
    }
    if (!isValidDate(date)) {
      return NextResponse.json(
        { error: "A valid date is required" },
        { status: 400 }
      );
    }
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // Avoid obvious duplicates: same slot + date + phone already waiting
    const existing = await db.waitlistEntry.findFirst({
      where: {
        slotId,
        date,
        phone,
        status: "waiting",
      },
    });
    if (existing) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        message: "You're already on the waitlist for this slot.",
      });
    }

    await db.waitlistEntry.create({
      data: {
        slotId,
        slotLabel,
        date,
        name,
        phone,
        email,
        userId,
        status: "waiting",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("waitlist create error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Admin-only listing of waitlist entries (optionally filtered by status)
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const slotId = searchParams.get("slotId") || undefined;
  const date = searchParams.get("date") || undefined;

  const where: any = {};
  if (status) where.status = status;
  if (slotId) where.slotId = slotId;
  if (date) where.date = date;

  const entries = await db.waitlistEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ entries });
}
