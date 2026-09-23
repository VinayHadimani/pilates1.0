import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (user) {
      // Generate a random reset token (32 hex bytes)
      const token = crypto.randomBytes(32).toString("hex");
      // 1-hour TTL — store as a Setting with key `reset_<token>` and value = userId.
      // We also include an expires timestamp so reset-password can validate TTL.
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
      const payload = JSON.stringify({ uid: user.id, exp: expiresAt });
      await db.setting.upsert({
        where: { key: `reset_${token}` },
        create: { key: `reset_${token}`, value: payload },
        update: { value: payload },
      });
      // In a production environment, you would send an email with a link like:
      //   https://yoursite.com/reset-password?token=<token>
      // For this simplified mock, we just store the token so the reset flow works.
    }

    // Always return ok — do not reveal whether the email exists.
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[auth/forgot-password] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
