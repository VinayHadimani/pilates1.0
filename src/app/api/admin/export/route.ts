import { NextRequest, NextResponse } from "next/server";
import { db, logAction } from "@/lib/audit";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/** Quote a CSV cell per RFC 4180. */
function cell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows: (string | number | null)[][]): string {
  if (!rows.length) return "";
  return rows.map((r) => r.map(cell).join(",")).join("\r\n");
}

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  return dt.toISOString();
}

/**
 * GET (admin only): export data as CSV.
 * Query: ?type=payments|bookings|members
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl || new URL(req.url, "http://localhost");
  const type = (url.searchParams.get("type") || "payments").toLowerCase();
  const valid = ["payments", "bookings", "members"];
  if (!valid.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Use one of: ${valid.join(", ")}` },
      { status: 400 }
    );
  }

  let csv = "";
  let filename = `${type}.csv`;

  if (type === "payments") {
    const payments = await db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    const header = [
      "id",
      "createdAt",
      "customerName",
      "customerEmail",
      "customerPhone",
      "amount",
      "currency",
      "status",
      "gateway",
      "gatewayTxnId",
      "planId",
      "membershipId",
      "bookingId",
      "invoiceUrl",
    ];
    const rows = payments.map((p) => [
      p.id,
      fmtDate(p.createdAt),
      p.customerName,
      p.customerEmail,
      p.customerPhone,
      p.amount,
      p.currency,
      p.status,
      p.gateway,
      p.gatewayTxnId,
      p.planId,
      p.membershipId,
      p.bookingId,
      p.invoiceUrl,
    ]);
    csv = toCsv([header, ...rows]);
    filename = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === "bookings") {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    const header = [
      "id",
      "createdAt",
      "type",
      "name",
      "phone",
      "email",
      "goal",
      "date",
      "slotLabel",
      "status",
      "notes",
      "planId",
      "slotId",
      "membershipId",
    ];
    const rows = bookings.map((b) => [
      b.id,
      fmtDate(b.createdAt),
      b.type,
      b.name,
      b.phone,
      b.email,
      b.goal,
      b.date,
      b.slotLabel,
      b.status,
      b.notes,
      b.planId,
      b.slotId,
      b.membershipId,
    ]);
    csv = toCsv([header, ...rows]);
    filename = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    // members — export Membership records (paying members).
    const memberships = await db.membership.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    const header = [
      "id",
      "createdAt",
      "name",
      "phone",
      "email",
      "planName",
      "startDate",
      "endDate",
      "classesPerWeek",
      "totalClasses",
      "usedClasses",
      "bonusClasses",
      "carryForward",
      "status",
    ];
    const rows = memberships.map((m) => [
      m.id,
      fmtDate(m.createdAt),
      m.name,
      m.phone,
      m.email,
      m.planName,
      m.startDate,
      m.endDate,
      m.classesPerWeek,
      m.totalClasses,
      m.usedClasses,
      m.bonusClasses,
      m.carryForward,
      m.status,
    ]);
    csv = toCsv([header, ...rows]);
    filename = `members-${new Date().toISOString().slice(0, 10)}.csv`;
  }

  await logAction(undefined, undefined, "export.csv", `type=${type}`);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
