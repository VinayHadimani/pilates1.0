import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

interface ManageBody {
  id: string;
  kind?: "booking" | "membership"; // default booking
  action: "cancel" | "reschedule" | "confirm" | "complete";
  phone?: string; // for non-admin verification
  newDate?: string;
  newSlot?: string;
  newLockedSlots?: { dayOfWeek: number; time: string; label: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ManageBody;
    const admin = await isAdmin();

    if (body.kind === "membership") {
      const m = await db.membership.findUnique({ where: { id: body.id } });
      if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (!admin && m.phone !== body.phone) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (body.action === "cancel") {
        const updated = await db.membership.update({
          where: { id: m.id },
          data: { status: "cancelled" },
        });
        return NextResponse.json({ ok: true, membership: updated });
      }
      if (body.action === "reschedule") {
        if (body.newLockedSlots) {
          const updated = await db.membership.update({
            where: { id: m.id },
            data: { lockedDates: JSON.stringify(body.newLockedSlots) },
          });
          return NextResponse.json({ ok: true, membership: updated });
        }
        return NextResponse.json({ error: "No new slots provided" }, { status: 400 });
      }
      const updated = await db.membership.update({
        where: { id: m.id },
        data: { status: body.action },
      });
      return NextResponse.json({ ok: true, membership: updated });
    }

    // booking
    const b = await db.booking.findUnique({ where: { id: body.id } });
    if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!admin && b.phone !== body.phone) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (body.action === "cancel") {
      const updated = await db.booking.update({
        where: { id: b.id },
        data: { status: "cancelled" },
      });
      return NextResponse.json({ ok: true, booking: updated });
    }
    if (body.action === "reschedule") {
      if (!body.newDate || !body.newSlot) {
        return NextResponse.json({ error: "New date and slot required" }, { status: 400 });
      }
      const updated = await db.booking.update({
        where: { id: b.id },
        data: { date: body.newDate, slotLabel: body.newSlot, status: "rescheduled" },
      });
      return NextResponse.json({ ok: true, booking: updated });
    }
    const map: Record<string, string> = {
      confirm: "confirmed",
      complete: "completed",
    };
    const updated = await db.booking.update({
      where: { id: b.id },
      data: { status: map[body.action] || body.action },
    });
    return NextResponse.json({ ok: true, booking: updated });
  } catch (e: any) {
    console.error("manage error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
