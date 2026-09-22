import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      token?: string;
      newPassword?: string;
    };

    const token = (body.token || "").trim();
    const newPassword = body.newPassword || "";

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const setting = await db.setting.findUnique({
      where: { key: `reset_${token}` },
    });

    if (!setting) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    let parsed: { uid?: string; exp?: number } = {};
    try {
      parsed = JSON.parse(setting.value);
    } catch {
      parsed = {};
    }

    if (!parsed.uid || (parsed.exp && parsed.exp < Date.now())) {
      // Delete expired token
      await db.setting.delete({ where: { key: setting.key } }).catch(() => {});
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(newPassword);
    await db.user.update({
      where: { id: parsed.uid },
      data: { passwordHash },
    });

    // One-time use: delete the setting
    await db.setting.delete({ where: { key: setting.key } }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[auth/reset-password] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
