import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/audit";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Create a mock payment order.
 * In a real app this would create a Razorpay order; here we just persist a
 * Payment row with status="pending" and return its id + amount.
 */
export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as {
      planId?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      userId?: string;
      membershipId?: string;
      bookingId?: string;
      amount?: number;
    };

    const customerName = (b.customerName || "").trim();
    const customerPhone = (b.customerPhone || "").trim();
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: "customerName and customerPhone are required" },
        { status: 400 }
      );
    }

    // Resolve amount — prefer an explicit amount, else fall back to the plan price.
    let amount = typeof b.amount === "number" && Number.isFinite(b.amount)
      ? b.amount
      : 0;

    if (!amount && b.planId) {
      const plan = await db.pricingPlan.findUnique({ where: { id: b.planId } });
      if (plan) amount = plan.price;
    }

    // Resolve userId — prefer the explicit field, else the logged-in user cookie.
    let userId = b.userId || null;
    if (!userId) {
      const cookieUserId = await getUserId();
      if (cookieUserId) userId = cookieUserId;
    }

    const payment = await db.payment.create({
      data: {
        userId: userId || null,
        membershipId: b.membershipId || null,
        planId: b.planId || null,
        bookingId: b.bookingId || null,
        amount,
        currency: "INR",
        status: "pending",
        gateway: "mock",
        customerName,
        customerEmail: b.customerEmail || null,
        customerPhone,
      },
    });

    return NextResponse.json({ ok: true, paymentId: payment.id, amount });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
