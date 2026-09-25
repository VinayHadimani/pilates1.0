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
  let hasUsedTrial = false;

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

    // Determine whether the user has already used their free trial.
    // We consider the trial "used" if the user has any prior booking of
    // type "trial" or "daily" tied to them by userId, phone, or email.
    if (user) {
      const trialCount = await db.booking.count({
        where: {
          type: { in: ["trial", "daily"] },
          OR: [
            { userId },
            { phone: user.phone },
            ...(user.email ? [{ email: user.email }] : []),
          ],
        },
      });
      hasUsedTrial = trialCount > 0;
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
      hasUsedTrial={hasUsedTrial}
    />
  );
}
