import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ContactBody {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
}

function clean(v: unknown, max = 1000): string {
  if (!v) return "";
  return String(v).slice(0, max).trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactBody;

    const name = clean(body.name, 120);
    const phone = clean(body.phone, 40);
    const email = clean(body.email, 200);
    const message = clean(body.message, 2000);

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // For now we simply log the submission. A future iteration can persist
    // this to a ContactSubmission model when needed.
    console.log("[contact] new submission", { name, phone, email, message });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("contact create error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
