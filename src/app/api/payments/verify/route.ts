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
    } else if (payment.planId) {
      // No existing membership — create one from the plan.
      const plan = await db.pricingPlan.findUnique({ where: { id: payment.planId } });
      if (plan && plan.type === "membership") {
        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + plan.durationMonths);

        // Check if a membership already exists for this user + plan (avoid duplicates)
        const existingMem = await db.membership.findFirst({
          where: {
            userId: payment.userId || undefined,
            planId: plan.id,
            status: "active",
          },
        });

        if (!existingMem) {
          await db.membership.create({
            data: {
              name: payment.customerName,
              phone: payment.customerPhone,
              email: payment.customerEmail || null,
              userId: payment.userId || null,
              planId: plan.id,
              planName: plan.name,
              startDate: start.toISOString().slice(0, 10),
              endDate: end.toISOString().slice(0, 10),
              classesPerWeek: plan.classesPerWeek,
              totalClasses: plan.totalClasses + plan.bonusClasses,
              usedClasses: 0,
              bonusClasses: plan.bonusClasses,
              carryForward: plan.carryForward,
              status: "active",
              lockedDates: "[]",
            },
          });
        }
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
