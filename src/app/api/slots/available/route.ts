import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/slots/available?date=yyyy-MM-dd
 *
 * Returns all active ClassSlot records that run on the given date's
 * weekday, with real-time capacity / booked / remaining counts.
 *
 * Bookings counted: confirmed | rescheduled (those are active seats)
 *   - For the specific date + slotLabel
 * Locked membership seats: any active membership whose lockedDates JSON
 *   array contains an entry matching this weekday + slotLabel.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json(
        { error: "date query parameter is required (yyyy-MM-dd)" },
        { status: 400 }
      );
    }
    // Validate date
    const parsed = new Date(date + "T00:00:00");
    if (isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    const weekday = parsed.getDay();

    // Fetch active slots for the given weekday.
    const slots = await db.classSlot.findMany({
      where: { dayOfWeek: weekday, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }],
    });

    if (slots.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // All slot labels for this weekday (so we can batch-count bookings).
    const labels = slots.map((s) => slotLabelStr(s));

    // Count active bookings for this date + each label.
    const bookingCounts = await db.booking.groupBy({
      by: ["slotLabel"],
      where: {
        date,
        slotLabel: { in: labels },
        status: { in: ["confirmed", "rescheduled"] },
      },
      _count: { _all: true },
    });
    const bookedMap = new Map<string, number>();
    for (const row of bookingCounts) {
      if (row.slotLabel) bookedMap.set(row.slotLabel, row._count._all);
    }

    // Count locked membership seats for this weekday + each label.
    const memberships = await db.membership.findMany({
      where: { status: "active" },
      select: { lockedDates: true },
    });
    const lockedMap = new Map<string, number>();
    for (const m of memberships) {
      try {
        const arr = JSON.parse(m.lockedDates || "[]") as {
          dayOfWeek: number;
          time: string;
          label: string;
        }[];
        for (const entry of arr) {
          if (entry.dayOfWeek === weekday && entry.label) {
            lockedMap.set(
              entry.label,
              (lockedMap.get(entry.label) || 0) + 1
            );
          }
        }
      } catch {
        // ignore malformed JSON
      }
    }

    const result = slots.map((s) => {
      const label = slotLabelStr(s);
      const booked = (bookedMap.get(label) || 0) + (lockedMap.get(label) || 0);
      const capacity = s.capacity;
      const remaining = Math.max(0, capacity - booked);
      return {
        id: s.id,
        className: s.className,
        startTime: s.startTime,
        endTime: s.endTime,
        sessionType: s.sessionType,
        capacity,
        booked,
        remaining,
        slotLabel: label,
        dayOfWeek: s.dayOfWeek,
      };
    });

    return NextResponse.json({ slots: result });
  } catch (e: any) {
    console.error("slots/available error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

function slotLabelStr(s: {
  className: string;
  startTime: string;
  endTime: string | null;
}): string {
  return `${s.className} · ${s.startTime}${s.endTime ? "–" + s.endTime : ""}`;
}
