import { NextResponse } from "next/server";
import { db } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET (admin only): list recent audit logs (last 100, newest first).
 */
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const auditLogs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ auditLogs });
}
