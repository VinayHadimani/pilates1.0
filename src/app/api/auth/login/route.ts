import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setUserCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string; // can also be phone
      password?: string;
    };

    const identifier = (body.email || "").trim();
    const password = body.password || "";

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/phone and password are required." },
        { status: 400 }
      );
    }

    // Allow login by email or phone. If it looks like an email use email,
    // otherwise fall back to phone match.
    const isEmail = identifier.includes("@");
    const normalizedEmail = isEmail ? identifier.toLowerCase() : undefined;

    const user = await db.user.findFirst({
      where: normalizedEmail
        ? { email: normalizedEmail }
        : { phone: identifier },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid email/phone or password." },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email/phone or password." },
        { status: 401 }
      );
    }

    await setUserCookie(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (e) {
    console.error("[auth/login] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
