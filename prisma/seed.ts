import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const db = new PrismaClient();

async function main() {
  /* 1. Admin user */
  await db.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: hashPassword("arcwave2024"),
    },
  });
  console.log("✓ Admin user seeded (admin / arcwave2024)");

  /* 2. Pricing plans */
  const plans = [
    {
      name: "1 Month · Twice a week",
      type: "membership",
      durationMonths: 1,
      frequency: "twice",
      classesPerWeek: 2,
      totalClasses: 8,
      bonusClasses: 1,
      carryForward: 5,
      price: 6000,
      tagline: "Begin your practice",
      features: "8 sessions over 4 weeks\nCarry forward up to 5 classes\nExpert reformer guidance\nCalendar-locked sessions",
      sortOrder: 1,
    },
    {
      name: "1 Month · Thrice a week",
      type: "membership",
      durationMonths: 1,
      frequency: "thrice",
      classesPerWeek: 3,
      totalClasses: 12,
      bonusClasses: 1,
      carryForward: 5,
      price: 8400,
      tagline: "More momentum, more flow",
      features: "12 sessions over 4 weeks\nCarry forward up to 5 classes\nExpert reformer guidance\nCalendar-locked sessions",
      sortOrder: 2,
    },
    {
      name: "3 Months · Twice a week",
      type: "membership",
      durationMonths: 3,
      frequency: "twice",
      classesPerWeek: 2,
      totalClasses: 24,
      bonusClasses: 3,
      carryForward: 15,
      price: 16500,
      oldPrice: 18000,
      isFeatured: true,
      tagline: "Build strength that stays",
      features: "24 sessions over 12 weeks\nCarry forward up to 15 classes\n3 bonus classes\nPriority scheduling",
      sortOrder: 3,
    },
    {
      name: "3 Months · Thrice a week",
      type: "membership",
      durationMonths: 3,
      frequency: "thrice",
      classesPerWeek: 3,
      totalClasses: 36,
      bonusClasses: 3,
      carryForward: 15,
      price: 23000,
      oldPrice: 25200,
      tagline: "Consistent, considered progress",
      features: "36 sessions over 12 weeks\nCarry forward up to 15 classes\n3 bonus classes\nPriority scheduling",
      sortOrder: 4,
    },
    {
      name: "6 Months · Twice a week",
      type: "membership",
      durationMonths: 6,
      frequency: "twice",
      classesPerWeek: 2,
      totalClasses: 48,
      bonusClasses: 4,
      carryForward: 28,
      price: 30000,
      oldPrice: 36000,
      tagline: "A practice that becomes you",
      features: "48 sessions over 24 weeks\nCarry forward up to 28 classes\n4 bonus classes\nBest value per session",
      sortOrder: 5,
    },
    {
      name: "6 Months · Thrice a week",
      type: "membership",
      durationMonths: 6,
      frequency: "thrice",
      classesPerWeek: 3,
      totalClasses: 72,
      bonusClasses: 4,
      carryForward: 28,
      price: 42000,
      oldPrice: 50400,
      tagline: "Deep transformation",
      features: "72 sessions over 24 weeks\nCarry forward up to 28 classes\n4 bonus classes\nBest value per session",
      sortOrder: 6,
    },
    {
      name: "Drop-in · Single class",
      type: "daily",
      durationMonths: 0,
      frequency: "",
      classesPerWeek: 0,
      totalClasses: 1,
      bonusClasses: 0,
      carryForward: 0,
      price: 1000,
      tagline: "Move with us for a day",
      features: "Single session access\nAny available class slot\nNo long-term commitment\nIdeal for visitors",
      sortOrder: 7,
    },
  ];

  for (const p of plans) {
    const existing = await db.pricingPlan.findFirst({ where: { name: p.name } });
    if (existing) {
      await db.pricingPlan.update({ where: { id: existing.id }, data: p });
    } else {
      await db.pricingPlan.create({ data: p });
    }
  }
  console.log(`✓ ${plans.length} pricing plans seeded`);

  /* 3. Class slots (weekly schedule) */
  const days = [
    { day: 1, label: "Monday" },
    { day: 2, label: "Tuesday" },
    { day: 3, label: "Wednesday" },
    { day: 4, label: "Thursday" },
    { day: 5, label: "Friday" },
    { day: 6, label: "Saturday" },
  ];
  const times = [
    { start: "07:00", end: "08:00", name: "Early Flow" },
    { start: "08:30", end: "09:30", name: "Morning Reformer" },
    { start: "10:00", end: "11:00", name: "Core & Mobility" },
    { start: "18:00", end: "19:00", name: "Evening Reformer" },
    { start: "19:30", end: "20:30", name: "Wind-down Flow" },
  ];

  let slotOrder = 0;
  for (const d of days) {
    for (const t of times) {
      const key = `${d.label}-${t.start}`;
      const existing = await db.classSlot.findFirst({
        where: { dayOfWeek: d.day, startTime: t.start },
      });
      const data = {
        dayOfWeek: d.day,
        startTime: t.start,
        endTime: t.end,
        className: t.name,
        capacity: 6,
        sortOrder: slotOrder++,
      };
      if (existing) {
        await db.classSlot.update({ where: { id: existing.id }, data });
      } else {
        await db.classSlot.create({ data });
      }
    }
  }
  console.log("✓ Weekly class schedule seeded");

  /* 4. Settings */
  const settings: Record<string, string> = {
    studioName: "Arcwave Pilates",
    tagline: "Find your strength. Find your flow.",
    subTagline: "Mindful movement. Meaningful strength.",
    location: "Thiruvanmiyur, Chennai",
    eyebrow: "Boutique Pilates · Thiruvanmiyur, Chennai",
    instagramUrl: "https://www.instagram.com/arcwavepilates/",
    instagramHandle: "@arcwavepilates",
    trialLink: "https://www.instagram.com/arcwavepilates/",
    trialNote: "Book a trial via Instagram. Two snaps to confirm your slot.",
    dailyBookingNote: "Pick a date and an available class slot below.",
    membershipNote: "Membership locks your weekly calendar. Reschedule anytime.",
    cancelNote: "Cancellations are immediate — reschedule to a new slot instantly.",
    founderName: "Niranjan",
    founderTitle: "FOUNDER · ARCWAVE PILATES",
    founderYears: "7+ years",
    founderYearsLabel: "of Pilates practice & expertise",
    founderPurpose: "One purpose",
    founderPurposeLabel: "Helping you move better",
    phone: "",
    email: "",
    heroDesc:
      "A stronger core. A little more ease. A whole new connection with your body. Discover mindful Pilates, guided by an expert who cares.",
    aboutDesc:
      "Meet Niranjan, founder of Arcwave Pilates and an internationally certified Pilates expert. With 7+ years mastering classical and contemporary Pilates, his approach brings together precision, patience and purposeful movement — helping you understand your body as you build strength.",
    approachDesc:
      "Move with intention. Build confidence in your body. Make room for a practice that feels like yours.",
  };

  for (const [k, v] of Object.entries(settings)) {
    const existing = await db.setting.findFirst({ where: { key: k } });
    if (existing) {
      await db.setting.update({ where: { id: existing.id }, data: { value: v } });
    } else {
      await db.setting.create({ data: { key: k, value: v } });
    }
  }
  console.log(`✓ ${Object.keys(settings).length} settings seeded`);

  console.log("\n🌱 Seed complete.");
  console.log("Admin login → username: admin · password: arcwave2024");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
