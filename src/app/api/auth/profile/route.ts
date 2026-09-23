import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

function normalize(value: string | undefined | null) {
  return (value || "").trim();
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emergencyContact: true,
        healthNotes: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    console.error("[auth/profile GET] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      emergencyContact?: string | null;
      healthNotes?: string | null;
    };

    const data: {
      name?: string;
      phone?: string;
      email?: string;
      emergencyContact?: string | null;
      healthNotes?: string | null;
    } = {};

    if (typeof body.name === "string") {
      const name = normalize(body.name);
      if (!name) {
        return NextResponse.json(
          { error: "Name cannot be empty." },
          { status: 400 }
        );
      }
      data.name = name;
    }
    if (typeof body.phone === "string") {
      const phone = normalize(body.phone);
      if (!phone) {
        return NextResponse.json(
          { error: "Phone cannot be empty." },
          { status: 400 }
        );
      }
      data.phone = phone;
    }
    if (typeof body.email === "string") {
      const email = normalize(body.email).toLowerCase();
      if (!email) {
        return NextResponse.json(
          { error: "Email cannot be empty." },
          { status: 400 }
        );
      }
      data.email = email;
    }
    if (body.emergencyContact !== undefined) {
      data.emergencyContact = body.emergencyContact
        ? normalize(body.emergencyContact)
        : null;
    }
    if (body.healthNotes !== undefined) {
      data.healthNotes = body.healthNotes ? body.healthNotes.trim() : null;
    }

    // If email or phone changed, ensure uniqueness
    if (data.email || data.phone) {
      const clash = await db.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                data.email ? { email: data.email } : {},
                data.phone ? { phone: data.phone } : {},
              ].filter((c) => Object.keys(c).length > 0) as any,
            },
          ],
        },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json(
          { error: "Email or phone already in use." },
          { status: 409 }
        );
      }
    }

    const updated = await db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emergencyContact: true,
        healthNotes: true,
      },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (e) {
    console.error("[auth/profile PATCH] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
