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
    { start: "07:00", end: "08:00", name: "Early Flow", type: "group", capacity: 4 },
    { start: "08:30", end: "09:30", name: "Morning Reformer", type: "group", capacity: 4 },
    { start: "10:00", end: "11:00", name: "Core & Mobility", type: "group", capacity: 4 },
    { start: "11:30", end: "12:30", name: "Private Session", type: "private", capacity: 1 },
    { start: "18:00", end: "19:00", name: "Evening Reformer", type: "group", capacity: 4 },
    { start: "19:30", end: "20:30", name: "Private Evening", type: "private", capacity: 1 },
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
        sessionType: t.type,
        capacity: t.capacity,
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
    phone: "+91 98765 43210",
    email: "hello@arcwavepilates.in",
    whatsappNumber: "919876543210",
    trialFee: "0",
    trialEligibility: "One trial per person",
    trialDuration: "45 minutes",
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

  /* 6. Trainers */
  const trainers = [
    {
      name: "Niranjan",
      title: "Founder & Lead Instructor",
      bio: "Internationally certified Pilates expert with 7+ years mastering classical and contemporary Pilates. His approach brings together precision, patience and purposeful movement.",
      specialities: "Reformer Pilates\nCadillac & Apparatus\nPre/Post-Natal\nMovement Therapy",
      sortOrder: 1,
    },
    {
      name: "Ananya",
      title: "Senior Instructor",
      bio: "STOTT-certified instructor specialising in biomechanical sequencing and mindful mat work. Ananya brings warmth and precision to every session.",
      specialities: "Mat Pilates\nReformer Pilates\nCore Conditioning",
      sortOrder: 2,
    },
    {
      name: "Vikram",
      title: "Instructor",
      bio: "BASI-trained with a background in rehabilitation. Vikram focuses on helping clients move better after injury, with patience and care.",
      specialities: "Rehabilitation-focused Pilates\nPrivate 1:1 Sessions\nCadillac",
      sortOrder: 3,
    },
  ];
  for (const t of trainers) {
    const existing = await db.trainer.findFirst({ where: { name: t.name } });
    if (existing) {
      await db.trainer.update({ where: { id: existing.id }, data: t });
    } else {
      await db.trainer.create({ data: t });
    }
  }
  console.log(`✓ ${trainers.length} trainers seeded`);

  /* 7. Blog posts (optional per PDF — 3 sample posts) */
  const blogPosts = [
    {
      title: "Why Pilates? A Beginner's Guide",
      slug: "why-pilates-beginners-guide",
      excerpt:
        "If you've been curious about Pilates but not sure where to begin, here's a gentle introduction to the breath, the core, and the reformer.",
      content:
        "Pilates is often described as a practice of mindful movement, and for good reason. Unlike workouts that push you toward exhaustion, Pilates asks you to slow down and feel — to notice the way your ribs expand when you breathe, the way your pelvis tilts, the way your shoulder blades glide across your back.\n\nThe first principle is breath. Before we add a single movement, we teach every new student to breathe into the sides and back of their ribcage. This lateral breath keeps the deep core engaged and creates space in the spine. Most people who try it for the first time are surprised at how much tension they have been holding without realising it.\n\nThe second is the core — but not the way you might expect. In Pilates, the core is not just the six-pack muscles. It is a cylinder of support that includes the deep transversus abdominis, the pelvic floor, the diaphragm and the small muscles along the spine. We call this the powerhouse, and every exercise is built around it.\n\nThe reformer — that spring-loaded carriage you see in the studio — is simply a tool to help you feel these connections more clearly. The springs provide resistance and support, so you can find muscles you didn't know you had. It is not intimidating once you understand the logic behind it.\n\nIf you are new, start with a trial. We will move slowly, name what you are feeling, and build a foundation you can return to for life.",
      status: "published",
      author: "Arcwave Pilates",
      publishedAt: new Date(),
    },
    {
      title: "5 Reformer Exercises for a Stronger Core",
      slug: "5-reformer-exercises-core",
      excerpt:
        "Five reformer moves we come back to again and again — and why they build deep, lasting strength rather than just surface tone.",
      content:
        "The reformer is the heart of our studio, and over the years we have settled on a handful of exercises that almost every member meets in their first month. Here are five of them — and what each one is really doing for you.\n\n1. Footwork. Lying on the carriage, feet on the bar, you press out and resist the springs on the way back in. It looks simple, but footwork wakes up the legs, aligns the knees and sets the pelvis. Most of us stand on legs that have forgotten how to push evenly — this teaches them again.\n\n2. The Hundred. The classic warm-up. Pumping the arms in time with the breath while holding a small abdominal curl. It builds endurance in the deep core and warms the body from the inside out.\n\n3. Frog in Straps. With the feet in straps, knees bent out to the side, you press out and in. The frog shapes the glutes and inner thighs while teaching the pelvis to stay still — a challenge for almost everyone the first time.\n\n4. Long Stretch. Hands on the footbar, body in a plank, you push the carriage out and pull it back. This is one of the best exercises for shoulder stability and full-body control on the reformer.\n\n5. Knee Stretches. Sitting at the back of the carriage, you press the knees out and draw them in while keeping the spine long. Knee stretches train the deep abdominals to hold against momentum — the key to a strong, resilient core.\n\nDone in sequence, these five exercises build a balanced foundation. You will feel taller, steadier and stronger — not just in the studio, but in everything you do.",
      status: "published",
      author: "Arcwave Pilates",
      publishedAt: new Date(),
    },
    {
      title: "Mindful Movement: The Arcwave Philosophy",
      slug: "mindful-movement-philosophy",
      excerpt:
        "What we mean by mindful movement, and why we believe the studio should feel less like a gym and more like a quiet conversation with your body.",
      content:
        "When we named the studio Arcwave, we were thinking about waves — about the way a single, slow movement can travel through the body, the way the breath rises and falls, the way strength builds in cycles rather than in straight lines.\n\nMindful movement, to us, means moving with attention. It means noticing the difference between effort and strain, between strength and tension. It means trusting that small, precise movements done well are worth more than big movements done carelessly.\n\nWe also believe a studio should feel calm. The reformer is a quiet machine. The room is light. The pace is unhurried. You are not here to exhaust yourself — you are here to learn a practice you can carry for the rest of your life.\n\nOur instructors are trained to watch closely and adjust gently. We don't shout counts across a crowded room. We work with one or two people at a time, so we can see what your body is doing today — not what the person on the next reformer is doing.\n\nThat is the Arcwave philosophy. Strength built with patience. Movement guided by breath. A practice that grows with you, not against you.",
      status: "published",
      author: "Arcwave Pilates",
      publishedAt: new Date(),
    },
  ];
  for (const p of blogPosts) {
    const existing = await db.blogPost.findFirst({ where: { slug: p.slug } });
    if (existing) {
      await db.blogPost.update({ where: { id: existing.id }, data: p });
    } else {
      await db.blogPost.create({ data: p });
    }
  }
  console.log(`✓ ${blogPosts.length} blog posts seeded`);

  /* 8. FAQs */
  const faqs = [
    { question: "I'm new to Pilates. Can I book a trial?", answer: "Absolutely. Tell the team you're a beginner and share what you'd like to work towards. They can help you understand the right starting point before you book. Use the trial booking form — it only takes a moment.", sortOrder: 1 },
    { question: "Do I need to be flexible already?", answer: "You don't need to arrive with advanced moves. Pilates is a practice of learning control and movement. Discuss your experience and needs with the instructor first.", sortOrder: 2 },
    { question: "How do memberships and carry-forward work?", answer: "Memberships run for 1, 3 or 6 months with twice or thrice a week options. Choose your weekly slots and we lock your recurring calendar. Unused classes carry forward — up to 5, 15 or 28 classes depending on your plan. You can reschedule any session instantly from the Manage tab.", sortOrder: 3 },
    { question: "Where is the studio?", answer: "Arcwave Pilates is in Thiruvanmiyur, Chennai. Ask the team for the exact studio pin and arrival details when arranging your visit.", sortOrder: 4 },
  ];
  for (const f of faqs) {
    const existing = await db.faqEntry.findFirst({ where: { question: f.question } });
    if (existing) { await db.faqEntry.update({ where: { id: existing.id }, data: f }); }
    else { await db.faqEntry.create({ data: f }); }
  }
  console.log(`✓ ${faqs.length} FAQs seeded`);

  /* 9. Sample reviews (approved) */
  const reviews = [
    { name: "Priya S.", rating: 5, title: "Changed how I move every day", body: "I came in with chronic back pain and left with a practice that changed how I move every day. Niranjan's cues are precise and patient.", source: "google", status: "approved", sortOrder: 1 },
    { name: "Arjun M.", rating: 5, title: "Best part of my week", body: "The reformer sessions are the best part of my week. Small group, personal attention, and I can feel my core getting stronger.", source: "google", status: "approved", sortOrder: 2 },
    { name: "Deepa R.", rating: 5, title: "Got my strength back", body: "After my pregnancy, I was looking for something gentle but effective. Arcwave gave me my strength back, one session at a time.", source: "google", status: "approved", sortOrder: 3 },
    { name: "Karthik V.", rating: 5, title: "None compare", body: "I've tried other studios — none compare. The space is calm, the teaching is world-class, and the community is real.", source: "google", status: "approved", sortOrder: 4 },
  ];
  for (const r of reviews) {
    const existing = await db.review.findFirst({ where: { name: r.name, body: r.body } });
    if (existing) { await db.review.update({ where: { id: existing.id }, data: r }); }
    else { await db.review.create({ data: r }); }
  }
  console.log(`✓ ${reviews.length} reviews seeded`);

  /* 10. Gallery images */
  const galleryImages = [
    { title: "Reformer Practice", imageUrl: "/images/45.jpg", caption: "Reformer workout, inverted pose", sortOrder: 1 },
    { title: "Strength & Balance", imageUrl: "/images/46.jpg", caption: "Strength, balance, control", sortOrder: 2 },
    { title: "Studio Session", imageUrl: "/images/47.jpg", caption: "Studio session in progress", sortOrder: 3 },
    { title: "Reformer Training", imageUrl: "/images/DSC04922.jpg", caption: "Peace, love, Pilates reformer", sortOrder: 4 },
    { title: "Reformer Flow", imageUrl: "/images/DSC04923.jpg", caption: "Guided reformer flow", sortOrder: 5 },
    { title: "Studio Interior", imageUrl: "/images/DSC04928.jpg", caption: "A space for purposeful movement", sortOrder: 6 },
  ];
  for (const g of galleryImages) {
    const existing = await db.galleryImage.findFirst({ where: { imageUrl: g.imageUrl } });
    if (existing) { await db.galleryImage.update({ where: { id: existing.id }, data: g }); }
    else { await db.galleryImage.create({ data: g }); }
  }
  console.log(`✓ ${galleryImages.length} gallery images seeded`);

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
