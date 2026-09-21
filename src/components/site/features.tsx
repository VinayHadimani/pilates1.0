"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";

const EASE = [0.22, 1, 0.36, 1] as const;

const CARDS = [
  {
    type: "image",
    img: "/images/feature-reformer.png",
    caption: "Find your flow.",
  },
  {
    type: "content",
    num: "01",
    title: "Mindful Movement.",
    items: [
      { title: "Core-focused conditioning", desc: "Strength, stability and control." },
      { title: "Purpose over pressure", desc: "Move with intention, not strain." },
      { title: "Breath-led practice", desc: "Reconnect to body and moment." },
      { title: "Flexibility & mobility", desc: "Thoughtful, controlled movement." },
    ],
    href: "#about",
  },
  {
    type: "content",
    num: "02",
    title: "Expert Guidance.",
    items: [
      { title: "Internationally certified", desc: "Trained in classical & contemporary." },
      { title: "7+ years of practice", desc: "Precision, patience, purpose." },
      { title: "Boutique studio setting", desc: "Personal attention, every session." },
    ],
    href: "#about",
  },
  {
    type: "content",
    num: "03",
    title: "Membership & Booking.",
    items: [
      { title: "Flexible membership plans", desc: "1, 3 or 6 months. Twice or thrice a week." },
      { title: "Carry-forward classes", desc: "Extra classes move with you." },
      { title: "Easy reschedule", desc: "Cancel and rebook instantly." },
    ],
    href: "#booking",
  },
];

export function Features() {
  return (
    <section
      id="studio"
      className="relative min-h-screen w-full overflow-hidden bg-black px-4 py-20 md:px-6 md:py-28"
    >
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-15" />

      <div className="relative mx-auto max-w-7xl">
        <h2 className="max-w-5xl text-xl font-normal leading-tight tracking-tight sm:text-2xl md:text-3xl lg:text-4xl">
          <div className="text-[#E1E0CC]">
            <WordsPullUpMultiStyle
              segments={[{ text: "Studio-grade movement for every body." }]}
            />
          </div>
          <div className="mt-2 text-gray-500">
            <WordsPullUpMultiStyle
              delay={0.2}
              segments={[{ text: "Built for flow. Powered by purpose." }]}
            />
          </div>
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2 md:gap-1 lg:grid-cols-4">
          {CARDS.map((card, i) => (
            <FeatureCard key={i} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ card, index }: { card: any; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: EASE }}
      className={`relative h-full overflow-hidden rounded-2xl ${
        card.type === "image" ? "" : "bg-[#212121] p-6 md:p-8"
      } lg:h-[480px]`}
    >
      {card.type === "image" ? (
        <>
          <img
            src={card.img}
            alt="Arcwave Pilates reformer"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-lg font-medium text-[#E1E0CC] sm:text-xl">
              {card.caption}
            </p>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/50">
              {card.num}
            </span>
            <img
              src="/images/arcwave-01.png"
              alt=""
              className="h-10 w-10 rounded-full object-cover opacity-80 sm:h-12 sm:w-12"
            />
          </div>

          <h3 className="mt-6 text-xl font-medium text-[#E1E0CC] sm:text-2xl">
            {card.title}
          </h3>

          <ul className="mt-6 flex-1 space-y-3">
            {card.items.map((it: any, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-[#E1E0CC]">{it.title}</p>
                  <p className="text-xs text-gray-400">{it.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <a
            href={card.href}
            className="group mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary/70 transition-colors hover:text-primary"
          >
            Learn more
            <ArrowRight className="h-4 w-4 -rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
