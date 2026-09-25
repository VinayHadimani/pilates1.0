import { db } from "@/lib/db";
import { getSlots } from "@/lib/site";
import { getUserId } from "@/lib/auth";
import { BookPage } from "@/components/site/book-page";

export const dynamic = "force-dynamic";

export default async function BookPageWrapper() {
  const [slots, userId] = await Promise.all([
    getSlots(),
    getUserId(),
  ]);

  let user: { id: string; name: string; email: string; phone: string } | null = null;
  let membership: { id: string; planName: string; totalClasses: number; usedClasses: number; bonusClasses: number; classesPerWeek: number; status: string } | null = null;

  if (userId) {
    const [u, m] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true } }),
      db.membership.findFirst({ where: { userId, status: "active" }, orderBy: { createdAt: "desc" } }),
    ]);
    user = u;
    if (m) {
      membership = {
        id: m.id,
        planName: m.planName,
        totalClasses: m.totalClasses,
        usedClasses: m.usedClasses,
        bonusClasses: m.bonusClasses,
        classesPerWeek: m.classesPerWeek,
        status: m.status,
      };
    }
  }

  const clientSlots = slots.map((s) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    className: s.className,
    capacity: s.capacity,
    sessionType: s.sessionType,
  }));

  return (
    <BookPage
      slots={clientSlots}
      user={user}
      membership={membership}
    />
  );
}
