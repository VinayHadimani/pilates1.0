import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Verify (mark as success) a mock payment.
 * If the payment was for a membership, the linked Membership is set to
 * status="active". An in-app NotificationLog entry is also created.
 */
export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as {
      paymentId?: string;
      gatewayTxnId?: string;
    };
    if (!b.paymentId) {
      return NextResponse.json({ error: "paymentId is required" }, { status: 400 });
    }

    const existing = await db.payment.findUnique({ where: { id: b.paymentId } });
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const invoiceUrl = `/invoices/${existing.id}`;

    const payment = await db.payment.update({
      where: { id: existing.id },
      data: {
        status: "success",
        gatewayTxnId: b.gatewayTxnId || existing.gatewayTxnId || `mock_${Date.now()}`,
        invoiceUrl,
      },
    });

    // If this paid for a membership, activate it.
    if (payment.membershipId) {
      const m = await db.membership.findUnique({ where: { id: payment.membershipId } });
      if (m && m.status !== "active") {
        await db.membership.update({
          where: { id: m.id },
          data: { status: "active" },
        });
      }
    }

    // In-app notification log for the buyer.
    try {
      await db.notificationLog.create({
        data: {
          userId: payment.userId || null,
          channel: "in-app",
          type: "payment_success",
          recipient: payment.customerEmail || payment.customerPhone,
          subject: "Payment successful",
          message: `Your payment of ₹${payment.amount} has been received. Invoice: ${invoiceUrl}`,
          status: "sent",
        },
      });
    } catch {
      // best-effort
    }

    return NextResponse.json({ ok: true, payment });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
