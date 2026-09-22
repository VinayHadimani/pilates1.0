import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// Member self-service: look up bookings & memberships by phone
export async function POST(req: NextRequest) {
  try {
    const { phone } = (await req.json()) as { phone?: string };
    if (!phone || phone.trim().length < 4) {
      return NextResponse.json({ error: "Enter a valid phone" }, { status: 400 });
    }
    const p = phone.trim();

    const bookings = await db.booking.findMany({
      where: { phone: { contains: p } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const memberships = await db.membership.findMany({
      where: { phone: { contains: p } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ bookings, memberships });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
