import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ authed: await isAdmin() });
}
