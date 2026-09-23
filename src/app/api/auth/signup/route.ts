import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setUserCookie } from "@/lib/auth";

export const runtime = "nodejs";

function normalize(value: string) {
  return value.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      password?: string;
      consentAccepted?: boolean;
    };

    const name = normalize(body.name || "");
    const phone = normalize(body.phone || "");
    const email = normalize(body.email || "").toLowerCase();
    const password = body.password || "";
    const consentAccepted = body.consentAccepted === true;

    if (!name || !phone || !email || !password) {
      return NextResponse.json(
        { error: "Name, phone, email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if email or phone already exists
    const existing = await db.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        phone,
        email,
        passwordHash,
        role: "member",
        isActive: true,
        consentAccepted,
      },
    });

    // Feature 5 — Trial conversion auto-link:
    // Find any existing trial bookings (type="trial") with the same phone or
    // email and stamp their `convertedToUserId` with the new user's id so the
    // trial is linked to the registered account.
    try {
      const trials = await db.booking.findMany({
        where: {
          type: "trial",
          OR: [{ phone }, { email }],
          convertedToUserId: null,
        },
        select: { id: true },
      });
      if (trials.length > 0) {
        await db.booking.updateMany({
          where: {
            id: { in: trials.map((t) => t.id) },
          },
          data: { convertedToUserId: user.id },
        });
      }
    } catch {
      // Best-effort linking — never block signup if this fails.
    }

    await setUserCookie(user.id);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (e) {
    console.error("[auth/signup] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
