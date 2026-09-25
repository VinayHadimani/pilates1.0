import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";
import {
  isAdmin,
  createSessionToken,
  hashPassword,
  USER_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export const runtime = "nodejs";

interface CreateBody {
  type: "trial" | "daily" | "membership";
  name: string;
  phone: string;
  email?: string;
  goal?: string;
  planId?: string;
  slotId?: string;
  date?: string; // yyyy-MM-dd
  slotLabel?: string;
  // membership-specific: chosen recurring weekly slots
  lockedSlots?: { dayOfWeek: number; time: string; label: string }[];
  notes?: string;
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
    const body = (await req.json()) as CreateBody;
    const type = body.type;

    if (!["trial", "daily", "membership"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid booking type" },
        { status: 400 }
      );
    }
    const name = clean(body.name);
    const phone = clean(body.phone, 40);
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // ---- TRIAL ----
    if (type === "trial") {
      const booking = await db.booking.create({
        data: {
          type: "trial",
          name,
          phone,
          email: clean(body.email),
          goal: clean(body.goal, 300),
          status: "pending",
          notes: clean(body.notes),
        },
      });
      return NextResponse.json({ ok: true, booking });
    }

    // ---- DAILY ----
    if (type === "daily") {
      if (!isValidDate(body.date)) {
        return NextResponse.json({ error: "A valid date is required" }, { status: 400 });
      }
      if (!body.slotLabel) {
        return NextResponse.json({ error: "Please pick a class slot" }, { status: 400 });
      }
      // capacity check — count both daily and confirmed trial bookings against the slot
      const slot = body.slotId
        ? await db.classSlot.findUnique({ where: { id: body.slotId } })
        : null;
      const capacity = slot?.capacity ?? 6;

      const sameSlotCount = await db.booking.count({
        where: {
          type: { in: ["daily", "trial"] },
          date: body.date,
          slotLabel: body.slotLabel,
          status: { in: ["confirmed", "pending", "rescheduled"] },
        },
      });
      // also count memberships locking this weekday+time
      const weekday = new Date(body.date + "T00:00:00").getDay();
      const memberships = await db.membership.findMany({
        where: { status: "active" },
      });
      let locked = 0;
      for (const m of memberships) {
        try {
          const arr = JSON.parse(m.lockedDates || "[]") as {
            dayOfWeek: number;
            time: string;
            label: string;
          }[];
          if (arr.some((s) => s.dayOfWeek === weekday && s.label === body.slotLabel)) {
            locked++;
          }
        } catch {}
      }

      if (sameSlotCount + locked >= capacity) {
        return NextResponse.json(
          { error: "This slot is fully booked. Please choose another slot." },
          { status: 409 }
        );
      }

      // ---- Identify the user (logged in via cookie, or by phone/email) ----
      const emailClean = clean(body.email);
      const userIdInput = clean(body.userId, 40) || null;
      let identifiedUserId: string | null = userIdInput;
      let existingUser: { id: string } | null = null;
      if (!identifiedUserId) {
        existingUser = await db.user.findFirst({
          where: {
            OR: [
              { phone },
              ...(emailClean ? [{ email: emailClean }] : []),
            ],
          },
          select: { id: true },
        });
        if (existingUser) identifiedUserId = existingUser.id;
      }

      // ---- Check for prior trial/daily bookings (by userId, phone, or email) ----
      const priorBookings = await db.booking.findMany({
        where: {
          type: { in: ["trial", "daily"] },
          OR: [
            { phone },
            ...(emailClean ? [{ email: emailClean }] : []),
            ...(identifiedUserId ? [{ userId: identifiedUserId }] : []),
          ],
        },
        select: { id: true },
        take: 1,
      });
      const hasPriorBookings = priorBookings.length > 0;

      // ---- Find active membership (by provided membershipId, userId, or phone) ----
      let membership: Awaited<ReturnType<typeof db.membership.findFirst>> = null;
      if (body.membershipId) {
        const m = await db.membership.findUnique({
          where: { id: body.membershipId },
        });
        if (m) membership = m;
      }
      if (!membership && identifiedUserId) {
        membership = await db.membership.findFirst({
          where: { userId: identifiedUserId, status: "active" },
          orderBy: { createdAt: "desc" },
        });
      }
      if (!membership) {
        membership = await db.membership.findFirst({
          where: { phone, status: "active" },
          orderBy: { createdAt: "desc" },
        });
      }
      const hasActiveMembership = !!membership && membership.status === "active";

      // ---- Decide: free trial / normal daily / error ----
      let bookingType: "trial" | "daily" = "daily";
      let shouldDeductCredit = false;

      if (hasActiveMembership) {
        // Member with an active membership: proceed normally (daily, deduct 1 credit)
        bookingType = "daily";
        shouldDeductCredit = true;
      } else if (!hasPriorBookings) {
        // First-time user: free trial — type=trial, status=confirmed, no credit deduction
        bookingType = "trial";
        shouldDeductCredit = false;
      } else {
        // Trial already used and no active membership — block the booking
        return NextResponse.json(
          {
            error:
              "You've used your free trial. Please purchase a membership to continue booking.",
          },
          { status: 403 }
        );
      }

      // ---- Create the booking ----
      const booking = await db.booking.create({
        data: {
          type: bookingType,
          name,
          phone,
          email: emailClean,
          userId: identifiedUserId,
          membershipId: hasActiveMembership && membership ? membership.id : null,
          slotId: clean(body.slotId),
          date: body.date!,
          slotLabel: body.slotLabel,
          status: "confirmed",
          notes: clean(body.notes),
        },
      });

      // ---- Deduct 1 credit if applicable ----
      if (shouldDeductCredit && membership) {
        const remaining =
          membership.totalClasses + membership.bonusClasses - membership.usedClasses;
        if (remaining > 0) {
          await db.membership.update({
            where: { id: membership.id },
            data: { usedClasses: membership.usedClasses + 1 },
          });
        }
      }

      // ---- Auto-create / link the user if not logged in ----
      // After the booking is created, make sure the guest has a User account
      // (find by phone/email, or create a new one with a random password so they
      // can't log in until they reset). Then link the booking to that user and
      // set the user session cookie so they're "logged in" for their dashboard.
      let finalUserId = identifiedUserId;
      if (!finalUserId) {
        if (existingUser) {
          finalUserId = existingUser.id;
        } else {
          const randomPassword = crypto.randomBytes(32).toString("hex");
          const newUser = await db.user.create({
            data: {
              name,
              phone,
              // email is unique & non-null on the User model — fall back to a
              // deterministic local address when the guest didn't supply one.
              email: emailClean || `${phone}@arcwave.guest`,
              passwordHash: hashPassword(randomPassword),
              consentAccepted: false,
              role: "member",
              isActive: true,
            },
          });
          finalUserId = newUser.id;
        }

        // Link the booking to the (existing or newly created) user
        await db.booking.update({
          where: { id: booking.id },
          data: { userId: finalUserId },
        });

        // If we found an active membership by phone that wasn't yet linked to a
        // user, link it now so the user can see it in their dashboard.
        if (hasActiveMembership && membership && !membership.userId) {
          await db.membership.update({
            where: { id: membership.id },
            data: { userId: finalUserId },
          });
        }

        // Set the user session cookie on the outgoing response
        const c = await cookies();
        c.set(USER_COOKIE, createSessionToken(finalUserId), {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: SESSION_MAX_AGE,
        });
      }

      return NextResponse.json({
        ok: true,
        booking,
        isTrial: bookingType === "trial",
      });
    }

    // ---- MEMBERSHIP ----
    if (type === "membership") {
      const plan = body.planId
        ? await db.pricingPlan.findUnique({ where: { id: body.planId } })
        : null;
      if (!plan || plan.type !== "membership" || !plan.isActive) {
        return NextResponse.json({ error: "Invalid membership plan" }, { status: 400 });
      }
      // lockedSlots is now OPTIONAL — slot locking happens after payment
      // (the next step). If provided, store them; if not, empty array.
      const locked = (body.lockedSlots || []).filter(
        (s) => s && s.dayOfWeek != null && s.time
      );

      const start = new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + plan.durationMonths);

      const booking = await db.booking.create({
        data: {
          type: "membership",
          name,
          phone,
          email: clean(body.email),
          planId: plan.id,
          status: "pending", // pending until payment + slot selection
          notes: clean(body.notes),
        },
      });

      const membership = await db.membership.create({
        data: {
          name,
          phone,
          email: clean(body.email),
          planId: plan.id,
          planName: plan.name,
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          classesPerWeek: plan.classesPerWeek,
          totalClasses: plan.totalClasses,
          usedClasses: 0,
          bonusClasses: plan.bonusClasses,
          carryForward: plan.carryForward,
          lockedDates: JSON.stringify(locked),
          status: "active",
          bookingId: booking.id,
        },
      });

      return NextResponse.json({ ok: true, booking, membership });
    }

    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  } catch (e: any) {
    console.error("booking create error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const q = searchParams.get("q") || undefined;

  const where: any = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ bookings });
}
