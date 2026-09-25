import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Certifications } from "@/components/site/certifications";
import { Trainers } from "@/components/site/trainers";
import { Programs } from "@/components/site/programs";
import { Features } from "@/components/site/features";
import { Pricing } from "@/components/site/pricing";
import { BookingSection } from "@/components/site/booking-section";
import { Gallery } from "@/components/site/gallery";
import { Testimonials } from "@/components/site/testimonials";
import { ReviewForm } from "@/components/site/review-form";
import { Contact } from "@/components/site/contact";
import { Faq } from "@/components/site/faq";
import { Footer } from "@/components/site/footer";
import {
  getSettings,
  getPlans,
  getSlots,
  getCertificates,
  getTrainers,
  getGalleryImages,
  getFAQs,
  getReviews,
} from "@/lib/site";

export const dynamic = "force-dynamic";

function s(settings: Record<string, string>, key: string, fallback: string) {
  return settings[key] ?? fallback;
}

export default async function Home() {
  const [settings, plans, slots, certificates, trainers, galleryImages, faqs, reviews] = await Promise.all([
    getSettings(),
    getPlans(),
    getSlots(),
    getCertificates(),
    getTrainers(),
    getGalleryImages(),
    getFAQs(),
    getReviews(),
  ]);
  const instagramUrl = s(
    settings,
    "instagramUrl",
    "https://www.instagram.com/arcwavepilates/"
  );

  // Sanitize for client components (drop Date fields)
  const clientPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
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
  const clientSlots = slots.map((sl) => ({
    id: sl.id,
    dayOfWeek: sl.dayOfWeek,
    startTime: sl.startTime,
    endTime: sl.endTime,
    className: sl.className,
    capacity: sl.capacity,
    isActive: sl.isActive,
  }));

  const clientReviews = reviews.map((r) => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    title: r.title,
    body: r.body,
    source: r.source,
    googleUrl: r.googleUrl,
  }));

  return (
    <main className="flex min-h-screen flex-col bg-paper">
      <div id="top" />
      <Hero
        eyebrow={s(settings, "eyebrow", "Boutique Pilates · Thiruvanmiyur, Chennai")}
        tagline={s(settings, "tagline", "Breath · Move · Flow")}
        description={s(
          settings,
          "heroDesc",
          "A stronger core. A little more ease. A whole new connection with your body."
        )}
        subTagline={s(settings, "subTagline", "Mindful movement. Meaningful strength.")}
      />
      <About
        eyebrow={s(settings, "founderEyebrow", "The person behind your progress")}
        aboutDesc={s(
          settings,
          "aboutDesc",
          "Meet Niranjan, founder of Arcwave Pilates and an internationally certified Pilates expert. With 7+ years mastering classical and contemporary Pilates, his approach brings together precision, patience and purposeful movement — helping you understand your body as you build strength."
        )}
        founderName={s(settings, "founderName", "Niranjan")}
        founderTitle={s(settings, "founderTitle", "FOUNDER · ARCWAVE PILATES")}
        founderYears={s(settings, "founderYears", "7+ years")}
        founderYearsLabel={s(
          settings,
          "founderYearsLabel",
          "of Pilates practice & expertise"
        )}
        founderPurpose={s(settings, "founderPurpose", "One purpose")}
        founderPurposeLabel={s(settings, "founderPurposeLabel", "Helping you move better")}
      />
      <Certifications
        certificates={certificates}
        founderName={s(settings, "founderName", "Niranjan")}
      />
      <Trainers trainers={trainers} />
      <Programs />
      <Features />
      <Pricing plans={plans} />
      <BookingSection plans={clientPlans} slots={clientSlots} settings={settings} />
      <Gallery images={galleryImages} />
      <Testimonials reviews={clientReviews} />
      <ReviewForm />
      <Contact />
      <Faq faqs={faqs} instagramUrl={instagramUrl} />
      <Footer
        studioName={s(settings, "studioName", "Arcwave Pilates")}
        tagline={s(settings, "tagline", "Breath · Move · Flow")}
        subTagline={s(settings, "subTagline", "Mindful movement. Meaningful strength.")}
        location={s(settings, "location", "Thiruvanmiyur, Chennai")}
        instagramUrl={instagramUrl}
        instagramHandle={s(settings, "instagramHandle", "@arcwavepilates")}
      />
    </main>
  );
}
