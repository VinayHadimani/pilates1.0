import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setAdminCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };
    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }
    const admin = await db.adminUser.findUnique({
      where: { username: username.trim() },
    });
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
    await setAdminCookie(admin.username);
    return NextResponse.json({ ok: true, username: admin.username });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
