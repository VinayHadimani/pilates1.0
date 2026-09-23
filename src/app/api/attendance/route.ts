import { NextRequest, NextResponse } from "next/server";
import { db, logAction, getAdminActor } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * POST (admin only): create or update an attendance record for a booking.
 * Body: { bookingId, status: "attended"|"absent"|"no-show", notes?, markedBy? }
 * The linked Booking's status is also updated to mirror the attendance.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const b = (await req.json()) as {
      bookingId?: string;
      status?: string;
      notes?: string;
      markedBy?: string;
    };

    if (!b.bookingId || !b.status) {
      return NextResponse.json(
        { error: "bookingId and status are required" },
        { status: 400 }
      );
    }

    const valid = ["attended", "absent", "no-show"];
    const status = valid.includes(b.status) ? b.status : "attended";

    const booking = await db.booking.findUnique({ where: { id: b.bookingId } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const actor = await getAdminActor();
    const markedBy = b.markedBy || actor.name || "admin";

    // Upsert attendance for this booking (one record per booking).
    const existing = await db.attendance.findFirst({
      where: { bookingId: booking.id },
    });
    let attendance;
    if (existing) {
      attendance = await db.attendance.update({
        where: { id: existing.id },
        data: {
          status,
          notes: b.notes == null ? existing.notes : String(b.notes),
          markedBy,
        },
      });
    } else {
      attendance = await db.attendance.create({
        data: {
          bookingId: booking.id,
          status,
          markedBy,
          notes: b.notes == null ? null : String(b.notes),
        },
      });
    }

    // Mirror status onto the booking (for no-show we keep status as "no-show").
    await db.booking.update({
      where: { id: booking.id },
      data: { status },
    });

    await logAction(
      actor.id,
      actor.name,
      "attendance.mark",
      `booking=${booking.id} status=${status}`
    );

    return NextResponse.json({ ok: true, attendance });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
