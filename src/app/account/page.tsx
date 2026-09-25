import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { MemberDashboard } from "@/components/auth/member-dashboard";
import type {
  Membership,
  Booking,
  Payment,
  UserProfile,
} from "@/components/auth/types";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const userId = await getUserId();
  if (!userId) {
    redirect("/login");
  }

  // First fetch the user so we can match bookings/memberships/payments by
  // phone as well (covers trials booked before signup, and memberships
  // purchased before the user account was created).
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emergencyContact: true,
      healthNotes: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [memberships, bookings, payments] = await Promise.all([
    db.membership.findMany({
      where: {
        OR: [{ userId }, { phone: user.phone }],
      },
      orderBy: { createdAt: "desc" },
    }),
    // Trials booked before signup get their convertedToUserId stamped at
    // signup time; trials/membership bookings booked while logged in get
    // userId directly; legacy bookings may only share the phone.
    db.booking.findMany({
      where: {
        OR: [{ userId }, { convertedToUserId: userId }, { phone: user.phone }],
      },
      orderBy: { createdAt: "desc" },
    }),
    db.payment.findMany({
      where: {
        OR: [{ userId }, { customerPhone: user.phone }],
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    emergencyContact: user.emergencyContact || "",
    healthNotes: user.healthNotes || "",
    role: user.role,
  };

  const membershipData: Membership[] = memberships.map((m) => ({
    id: m.id,
    planName: m.planName,
    startDate: m.startDate,
    endDate: m.endDate,
    classesPerWeek: m.classesPerWeek,
    totalClasses: m.totalClasses,
    usedClasses: m.usedClasses,
    bonusClasses: m.bonusClasses,
    status: m.status,
    notes: m.notes || "",
  }));

  const bookingData: Booking[] = bookings.map((b) => ({
    id: b.id,
    type: b.type,
    date: b.date || "",
    slotLabel: b.slotLabel || "",
    status: b.status,
    name: b.name,
    notes: b.notes || "",
    createdAt: b.createdAt.toISOString(),
    phone: b.phone || "",
  }));

  const paymentData: Payment[] = payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    gateway: p.gateway,
    customerName: p.customerName,
    invoiceUrl: p.invoiceUrl || "",
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <MemberDashboard
      user={profile}
      memberships={membershipData}
      bookings={bookingData}
      payments={paymentData}
    />
  );
}
