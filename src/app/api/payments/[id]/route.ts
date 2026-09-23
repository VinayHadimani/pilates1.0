import { NextRequest, NextResponse } from "next/server";
import { db, logAction } from "@/lib/audit";
import { isAdmin, requireAdminRole } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * PATCH (admin only): update a payment's status (e.g. mark as refunded).
 * Accepts { status, gatewayTxnId?, notes? } — only fields present are updated.
 * Refunds / status changes are restricted to the "owner" role.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await requireAdminRole(["owner"])))
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );

  const { id } = await params;
  try {
    const b = (await req.json()) as any;
    const data: any = {};
    if ("status" in b) data.status = String(b.status);
    if ("gatewayTxnId" in b)
      data.gatewayTxnId = b.gatewayTxnId == null ? null : String(b.gatewayTxnId);
    if ("notes" in b) data.notes = b.notes == null ? null : String(b.notes);
    if ("invoiceUrl" in b)
      data.invoiceUrl = b.invoiceUrl == null ? null : String(b.invoiceUrl);

    const payment = await db.payment.update({ where: { id }, data });
    await logAction(undefined, undefined, "payment.update", `id=${id} status=${b.status ?? ""}`);
    return NextResponse.json({ ok: true, payment });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE (admin only): permanently remove a payment record.
 * Restricted to the "owner" role.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await requireAdminRole(["owner"])))
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );

  const { id } = await params;
  try {
    await db.payment.delete({ where: { id } });
    await logAction(undefined, undefined, "payment.delete", `id=${id}`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
