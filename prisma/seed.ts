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

  /* 2. Pricing plans — exact structure from the requirements PDF */
  const plans = [
    // ---- GROUP sessions ----
    {
      name: "Group · 1 Month · 2×/week",
      type: "membership",
      category: "group",
      durationMonths: 1,
      frequency: "twice",
      classesPerWeek: 2,
      totalClasses: 8,
      bonusClasses: 0,
      carryForward: 5,
      price: 9100,
      tagline: "Begin your group practice",
      features: "8 group sessions over 4 weeks\nCarry forward up to 5 classes\nExpert reformer guidance\nCalendar-locked sessions",
      sortOrder: 1,
    },
    {
      name: "Group · 1 Month · 3×/week",
      type: "membership",
      category: "group",
      durationMonths: 1,
      frequency: "thrice",
      classesPerWeek: 3,
      totalClasses: 12,
      bonusClasses: 0,
      carryForward: 5,
      price: 11600,
      tagline: "More momentum, more flow",
      features: "12 group sessions over 4 weeks\nCarry forward up to 5 classes\nExpert reformer guidance\nCalendar-locked sessions",
      sortOrder: 2,
    },
    {
      name: "Group · 3 Months · 2×/week",
      type: "membership",
      category: "group",
      durationMonths: 3,
      frequency: "twice",
      classesPerWeek: 2,
      totalClasses: 24,
      bonusClasses: 3,
      carryForward: 15,
      price: 24300,
      tagline: "Build strength that stays",
      features: "24 group sessions over 12 weeks\nCarry forward up to 15 classes\n3 bonus classes\nPriority scheduling",
      sortOrder: 3,
    },
    {
      name: "Group · 3 Months · 3×/week",
      type: "membership",
      category: "group",
      durationMonths: 3,
      frequency: "thrice",
      classesPerWeek: 3,
      totalClasses: 36,
      bonusClasses: 3,
      carryForward: 15,
      price: 31200,
      isFeatured: true,
      tagline: "Consistent, considered progress",
      features: "36 group sessions over 12 weeks\nCarry forward up to 15 classes\n3 bonus classes\nPriority scheduling",
      sortOrder: 4,
    },
    {
      name: "Group · 6 Months · 2×/week",
      type: "membership",
      category: "group",
      durationMonths: 6,
      frequency: "twice",
      classesPerWeek: 2,
      totalClasses: 48,
      bonusClasses: 4,
      carryForward: 28,
      price: 45800,
      tagline: "A practice that becomes you",
      features: "48 group sessions over 24 weeks\nCarry forward up to 28 classes\n4 bonus classes\nBest value per session",
      sortOrder: 5,
    },
    {
      name: "Group · 6 Months · 3×/week",
      type: "membership",
      category: "group",
      durationMonths: 6,
      frequency: "thrice",
      classesPerWeek: 3,
      totalClasses: 72,
      bonusClasses: 4,
      carryForward: 28,
      price: 58800,
      tagline: "Deep transformation",
      features: "72 group sessions over 24 weeks\nCarry forward up to 28 classes\n4 bonus classes\nBest value per session",
      sortOrder: 6,
    },
    // ---- PRIVATE sessions ----
    {
      name: "Private · 1 Month · 2×/week",
      type: "membership",
      category: "private",
      durationMonths: 1,
      frequency: "twice",
      classesPerWeek: 2,
      totalClasses: 8,
      bonusClasses: 0,
      carryForward: 5,
      price: 18100,
      tagline: "One-on-one attention",
      features: "8 private sessions over 4 weeks\n1:1 personalised programming\nCarry forward up to 5 classes\nDedicated instructor",
      sortOrder: 7,
    },
    {
      name: "Private · 1 Month · 3×/week",
      type: "membership",
      category: "private",
      durationMonths: 1,
      frequency: "thrice",
      classesPerWeek: 3,
      totalClasses: 12,
      bonusClasses: 0,
      carryForward: 5,
      price: 22100,
      tagline: "Accelerate with private focus",
      features: "12 private sessions over 4 weeks\n1:1 personalised programming\nCarry forward up to 5 classes\nDedicated instructor",
      sortOrder: 8,
    },
    {
      name: "Private · 3 Months · 2×/week",
      type: "membership",
      category: "private",
      durationMonths: 3,
      frequency: "twice",
      classesPerWeek: 2,
      totalClasses: 24,
      bonusClasses: 3,
      carryForward: 15,
      price: 48800,
      tagline: "Sustained private progress",
      features: "24 private sessions over 12 weeks\n1:1 personalised programming\nCarry forward up to 15 classes\nDedicated instructor",
      sortOrder: 9,
    },
    {
      name: "Private · 3 Months · 3×/week",
      type: "membership",
      category: "private",
      durationMonths: 3,
      frequency: "thrice",
      classesPerWeek: 3,
      totalClasses: 36,
      bonusClasses: 3,
      carryForward: 15,
      price: 59500,
      tagline: "Commit to your transformation",
      features: "36 private sessions over 12 weeks\n1:1 personalised programming\nCarry forward up to 15 classes\nDedicated instructor",
      sortOrder: 10,
    },
    {
      name: "Private · 6 Months · 2×/week",
      type: "membership",
      category: "private",
      durationMonths: 6,
      frequency: "twice",
      classesPerWeek: 2,
      totalClasses: 48,
      bonusClasses: 4,
      carryForward: 28,
      price: 92200,
      tagline: "A year of dedicated practice",
      features: "48 private sessions over 24 weeks\n1:1 personalised programming\nCarry forward up to 28 classes\nBest value per session",
      sortOrder: 11,
    },
    {
      name: "Private · 6 Months · 3×/week",
      type: "membership",
      category: "private",
      durationMonths: 6,
      frequency: "thrice",
      classesPerWeek: 3,
      totalClasses: 72,
      bonusClasses: 4,
      carryForward: 28,
      price: 112300,
      tagline: "Deep private transformation",
      features: "72 private sessions over 24 weeks\n1:1 personalised programming\nCarry forward up to 28 classes\nBest value per session",
      sortOrder: 12,
    },
    // ---- DROP-IN ----
    {
      name: "Drop-in · Group Session",
      type: "daily",
      category: "group",
      durationMonths: 0,
      frequency: "",
      classesPerWeek: 0,
      totalClasses: 1,
      bonusClasses: 0,
      carryForward: 0,
      price: 1700,
      tagline: "Move with us for a day",
      features: "Single group session\nAny available class slot\nNo long-term commitment\nIdeal for visitors",
      sortOrder: 13,
    },
    {
      name: "Drop-in · Private Session",
      type: "daily",
      category: "private",
      durationMonths: 0,
      frequency: "",
      classesPerWeek: 0,
      totalClasses: 1,
      bonusClasses: 0,
      carryForward: 0,
      price: 2700,
      tagline: "One-on-one for a day",
      features: "Single private 1:1 session\nPersonalised programming\nNo long-term commitment\nIdeal for visitors",
      sortOrder: 14,
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
    tagline: "Breath · Move · Flow",
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

  /* 5. Certificates */
  const certificates = [
    {
      title: "Comprehensive Pilates Certification (Classical & Contemporary)",
      issuer: "Pilates Method Alliance (PMA®)",
      year: "2018",
      description:
        "Internationally recognised certification covering both classical Pilates apparatus work and contemporary, evidence-informed movement principles.",
      sortOrder: 1,
    },
    {
      title: "Reformer Pilates Teacher Training",
      issuer: "STOTT Pilates®",
      year: "2019",
      description:
        "Advanced reformer certification focusing on biomechanical sequencing, spinal articulation and programming for different bodies.",
      sortOrder: 2,
    },
    {
      title: "Cadillac & Chair Apparatus Training",
      issuer: "Polestar Pilates®",
      year: "2020",
      description:
        "Specialised apparatus certification enabling rehabilitation-focused programming using the Cadillac trapeze table and stability chair.",
      sortOrder: 3,
    },
    {
      title: "Movement Therapy & Pre/Post-Natal Pilates",
      issuer: "BASI Pilates®",
      year: "2021",
      description:
        "Continuing education in pre- and post-natal Pilates, and movement therapy for clients returning from injury.",
      sortOrder: 4,
    },
    {
      title: "Continuing Education — Movement & Breath",
      issuer: "Workshops, 2022 – 2024",
      year: "2022 – 2024",
      description:
        "Ongoing study in breath-led movement, fascial conditioning and mindful practice — keeping the teaching current and curious.",
      sortOrder: 5,
    },
  ];
  for (const c of certificates) {
    const existing = await db.certificate.findFirst({ where: { title: c.title } });
    if (existing) {
      await db.certificate.update({ where: { id: existing.id }, data: c });
    } else {
      await db.certificate.create({ data: c });
    }
  }
  console.log(`✓ ${certificates.length} certificates seeded`);

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
