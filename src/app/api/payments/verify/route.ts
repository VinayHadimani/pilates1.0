import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Verify (mark as success) a mock payment.
 * If the payment was for a membership, the linked Membership is set to
 * status="active". An in-app NotificationLog entry is also created.
 *
 * Carry-forward (renewal) logic:
 *  When creating a brand-new membership from a plan purchase, look at the
 *  user's most recent previous membership. If it is currently active but
 *  close to expiry (endDate within the next 30 days) OR has expired within
 *  the last 30 days, the unused sessions (totalClasses + bonusClasses -
 *  usedClasses, capped by the new plan's `carryForward` policy) are added
 *  to the new membership's totalClasses. The carried-forward amount is
 *  recorded in the membership's `notes` field and the previous membership
 *  is marked as "expired" so it can no longer be drawn down accidentally.
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

    let newMembershipId: string | null = null;
    let carryForwardApplied = 0;
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
      newMembershipId = payment.membershipId;
    } else if (payment.planId) {
      // No existing membership — create one from the plan.
      const plan = await db.pricingPlan.findUnique({ where: { id: payment.planId } });
      if (plan && plan.type === "membership") {
        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + plan.durationMonths);

        // ----- Carry-forward candidate lookup -----
        // A previous membership qualifies for carry-forward if its endDate is
        // within ±30 days of today (i.e. active-but-close-to-expiry OR
        // expired-within-the-last-30-days).
        const todayISO = start.toISOString().slice(0, 10);
        const thirtyDaysAgo = new Date(start);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoISO = thirtyDaysAgo.toISOString().slice(0, 10);
        const thirtyDaysAhead = new Date(start);
        thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
        const thirtyDaysAheadISO = thirtyDaysAhead.toISOString().slice(0, 10);

        const previousCandidates = await db.membership.findMany({
          where: {
            OR: [
              { userId: payment.userId || undefined },
              { phone: payment.customerPhone || undefined },
            ],
            status: { in: ["active", "expired"] },
            endDate: { gte: thirtyDaysAgoISO, lte: thirtyDaysAheadISO },
          },
          orderBy: { createdAt: "desc" },
        });

        let carryForwardCount = 0;
        let previousMembershipId: string | null = null;
        if (previousCandidates.length > 0) {
          const prev = previousCandidates[0];
          const unused = Math.max(
            0,
            prev.totalClasses + prev.bonusClasses - prev.usedClasses
          );
          const maxAllowed = plan.carryForward || 0;
          carryForwardCount = maxAllowed > 0 ? Math.min(unused, maxAllowed) : 0;
          if (carryForwardCount > 0) {
            previousMembershipId = prev.id;
          }
        }

        // ----- Duplicate guard -----
        // Only block creation if there is already an active membership for
        // the SAME plan that is NOT close to expiry (endDate more than 30
        // days from now). Otherwise this is either a fresh purchase or a
        // legitimate renewal, and we should create a new membership (with
        // any carried-forward credits applied).
        const blockingExisting = await db.membership.findFirst({
          where: {
            OR: [
              { userId: payment.userId || undefined },
              { phone: payment.customerPhone || undefined },
            ],
            planId: plan.id,
            status: "active",
            endDate: { gt: thirtyDaysAheadISO },
          },
        });

        if (blockingExisting) {
          newMembershipId = blockingExisting.id;
        } else {
          // Effective total = plan's class count + carried-forward credits.
          // Bonus classes are stored separately so the dashboard can display
          // them as a distinct line item (and so totalClasses + bonusClasses
          // equals the effective pool of sessions).
          const newTotalClasses = plan.totalClasses + carryForwardCount;
          const notes =
            carryForwardCount > 0
              ? `Carried forward ${carryForwardCount} sessions from previous membership${previousMembershipId ? ` (id: ${previousMembershipId})` : ""}`
              : null;

          const created = await db.membership.create({
            data: {
              name: payment.customerName,
              phone: payment.customerPhone,
              email: payment.customerEmail || null,
              userId: payment.userId || null,
              planId: plan.id,
              planName: plan.name,
              startDate: todayISO,
              endDate: end.toISOString().slice(0, 10),
              classesPerWeek: plan.classesPerWeek,
              totalClasses: newTotalClasses,
              usedClasses: 0,
              bonusClasses: plan.bonusClasses,
              carryForward: plan.carryForward,
              notes,
              status: "active",
              lockedDates: "[]",
            },
          });

          // Link the freshly created membership to this payment so the
          // slot-locking step (next screen) can use the membership id.
          await db.payment.update({
            where: { id: payment.id },
            data: { membershipId: created.id },
          });
          newMembershipId = created.id;
          carryForwardApplied = carryForwardCount;

          // Mark the previous membership as expired so it is no longer
          // considered "active" for credit deduction / display purposes.
          if (previousMembershipId && previousMembershipId !== created.id) {
            try {
              await db.membership.update({
                where: { id: previousMembershipId },
                data: { status: "expired" },
              });
            } catch {
              // best-effort — never block the renewal on this update
            }
          }
        }
      }
    }

    // In-app notification log for the buyer.
    try {
      const note =
        carryForwardApplied > 0
          ? `Your payment of ₹${payment.amount} has been received. ${carryForwardApplied} session(s) carried forward from your previous membership. Invoice: ${invoiceUrl}`
          : `Your payment of ₹${payment.amount} has been received. Invoice: ${invoiceUrl}`;
      await db.notificationLog.create({
        data: {
          userId: payment.userId || null,
          channel: "in-app",
          type: "payment_success",
          recipient: payment.customerEmail || payment.customerPhone,
          subject: "Payment successful",
          message: note,
          status: "sent",
        },
      });
    } catch {
      // best-effort
    }

    return NextResponse.json({
      ok: true,
      payment,
      membershipId: newMembershipId,
      carryForward: carryForwardApplied,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
