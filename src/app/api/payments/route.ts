import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * List all payments (admin only) with simple pagination.
 * Query params: ?page=1&limit=50&status=success
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl || new URL(req.url, "http://localhost");
  const page = Math.max(1, Number(url.searchParams.get("page") || "1") || 1);
  const limit = Math.min(
    200,
    Math.max(1, Number(url.searchParams.get("limit") || "50") || 50)
  );
  const status = url.searchParams.get("status") || undefined;

  const where = status ? { status } : undefined;
  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.payment.count({ where }),
  ]);

  return NextResponse.json({
    payments,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}
