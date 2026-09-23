import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { getPlans, getSlots } from "@/lib/site";
import { PlansPage } from "@/components/auth/plans-page";

export const dynamic = "force-dynamic";

export default async function PlansPageWrapper() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const [user, plans, memberships, slots] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true },
    }),
    getPlans(),
    db.membership.findMany({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
    }),
    getSlots(),
  ]);

  if (!user) redirect("/login");

  const clientPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    category: p.category,
    durationMonths: p.durationMonths,
    frequency: p.frequency,
    classesPerWeek: p.classesPerWeek,
    totalClasses: p.totalClasses,
    bonusClasses: p.bonusClasses,
    carryForward: p.carryForward,
    price: p.price,
    currency: p.currency,
    oldPrice: p.oldPrice,
    tagline: p.tagline,
    features: p.features,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
  }));

  const clientSlots = slots.map((s) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    className: s.className,
    sessionType: s.sessionType,
    capacity: s.capacity,
    isActive: s.isActive,
  }));

  return (
    <PlansPage
      user={{ id: user.id, name: user.name, email: user.email, phone: user.phone }}
      plans={clientPlans}
      slots={clientSlots}
      activeMembershipCount={memberships.length}
    />
  );
}
