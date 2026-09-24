import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

interface LockSlot {
  slotId?: string;
  date?: string; // yyyy-MM-dd
  slotLabel?: string;
}

/**
 * POST /api/memberships/lock-slots
 *
 * Body: { membershipId: string, slots: LockSlot[] }
 *
 * For each selected slot:
 *   - Lookup the ClassSlot to read its className/startTime/endTime
 *   - Create a Booking (type="membership", status="confirmed")
 *     linked to the membership
 *   - Deduct 1 credit from membership.usedClasses
 *
 * Update the membership's lockedDates JSON array with the chosen weekly
 * slots (so they show up as "locked" seats in the public calendar).
 *
 * Returns { ok: true }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      membershipId?: string;
      slots?: LockSlot[];
    };

    const membershipId = (body.membershipId || "").trim();
    if (!membershipId) {
      return NextResponse.json(
        { error: "membershipId is required" },
        { status: 400 }
      );
    }
    const slots = Array.isArray(body.slots) ? body.slots : [];
    if (slots.length === 0) {
      return NextResponse.json(
        { error: "At least one slot must be selected" },
        { status: 400 }
      );
    }

    // Verify the membership belongs to the logged-in user.
    const membership = await db.membership.findUnique({
      where: { id: membershipId },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }
    if (membership.userId && membership.userId !== userId) {
      return NextResponse.json(
        { error: "This membership does not belong to you" },
        { status: 403 }
      );
    }
    if (membership.status !== "active") {
      return NextResponse.json(
        { error: "Membership is not active" },
        { status: 400 }
      );
    }

    // Ensure we don't over-spend remaining credits.
    const remaining =
      membership.totalClasses + membership.bonusClasses - membership.usedClasses;
    if (slots.length > remaining) {
      return NextResponse.json(
        {
          error: `You selected ${slots.length} slots but only have ${remaining} credits remaining.`,
        },
        { status: 400 }
      );
    }

    // Resolve slot metadata (className, times, weekday) for each selected slot.
    const lockedEntries: {
      dayOfWeek: number;
      time: string;
      label: string;
      date: string;
      slotId: string;
    }[] = [];

    for (const sel of slots) {
      const dateStr = (sel.date || "").trim();
      const label = (sel.slotLabel || "").trim();
      if (!dateStr || !label) {
        return NextResponse.json(
          { error: "Each slot must include date and slotLabel" },
          { status: 400 }
        );
      }
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { error: `Invalid date: ${dateStr}` },
          { status: 400 }
        );
      }
      const weekday = d.getDay();

      // Pull slot info (if available) to enrich the label/time
      let timeStr = "";
      if (sel.slotId) {
        const slot = await db.classSlot.findUnique({
          where: { id: sel.slotId },
        });
        if (slot) {
          timeStr = slot.startTime;
          // If the client didn't send a label, build one from the slot.
          if (!label) {
            sel.slotLabel = `${slot.className} · ${slot.startTime}${slot.endTime ? "–" + slot.endTime : ""}`;
          }
        }
      }
      // Fallback: try to extract time from the label "Reformer · 07:00–08:00"
      if (!timeStr) {
        const m = label.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
        if (m) timeStr = m[1];
      }

      lockedEntries.push({
        dayOfWeek: weekday,
        time: timeStr,
        label,
        date: dateStr,
        slotId: sel.slotId || "",
      });
    }

    // Create bookings for each selected slot.
    const bookingCreateData = lockedEntries.map((entry) => ({
      type: "membership" as const,
      name: membership.name,
      phone: membership.phone,
      email: membership.email || null,
      userId: membership.userId || null,
      membershipId: membership.id,
      planId: membership.planId,
      slotId: entry.slotId || null,
      date: entry.date,
      slotLabel: entry.label,
      status: "confirmed" as const,
    }));

    // Insert bookings one-by-one (SQLite handles concurrency poorly with
    // nested createMany on Booking; safer to loop).
    for (const data of bookingCreateData) {
      await db.booking.create({ data });
    }

    // Update the membership: add 1 to usedClasses per slot, and persist the
    // locked weekly slots (deduped by dayOfWeek + time + label).
    const existingLocked = (() => {
      try {
        return JSON.parse(membership.lockedDates || "[]") as {
          dayOfWeek: number;
          time: string;
          label: string;
        }[];
      } catch {
        return [];
      }
    })();

    const lockedMap = new Map<string, { dayOfWeek: number; time: string; label: string }>();
    for (const e of existingLocked) {
      lockedMap.set(`${e.dayOfWeek}|${e.time}|${e.label}`, e);
    }
    for (const e of lockedEntries) {
      const key = `${e.dayOfWeek}|${e.time}|${e.label}`;
      if (!lockedMap.has(key)) {
        lockedMap.set(key, {
          dayOfWeek: e.dayOfWeek,
          time: e.time,
          label: e.label,
        });
      }
    }
    const mergedLocked = Array.from(lockedMap.values());

    await db.membership.update({
      where: { id: membership.id },
      data: {
        // DON'T deduct credits here — only when admin marks attendance
        lockedDates: JSON.stringify(mergedLocked),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("lock-slots error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
