"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Star, Menu, X } from "lucide-react";
import { WordsPullUp } from "@/components/anim/words-pull-up";
import { useBookingStore } from "@/lib/booking-store";

const NAV = [
  { label: "Our story", href: "#about" },
  { label: "The studio", href: "#studio" },
  { label: "Certifications", href: "#certifications" },
  { label: "Programs", href: "#pricing" },
  { label: "Book", href: "#booking" },
  { label: "FAQs", href: "#faq" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({
  eyebrow,
  tagline,
  description,
  subTagline,
}: {
  eyebrow: string;
  tagline: string;
  description: string;
  subTagline: string;
}) {
  const setTab = useBookingStore((s) => s.setTab);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="min-h-[100svh] w-full p-3 relative md:min-h-screen md:p-6">
      <div className="relative h-full min-h-[100svh] w-full overflow-hidden rounded-2xl bg-teal md:rounded-[2rem]">
        {/* Ambient gradient blobs — soft, drifting light for depth */}
        <div className="pointer-events-none absolute -left-32 top-1/4 h-[36rem] w-[36rem] rounded-full bg-lime/30 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 top-0 h-[28rem] w-[28rem] rounded-full bg-paper/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-[32rem] w-[32rem] rounded-full bg-tealDark/40 blur-[110px]" />
        {/* Subtle noise texture */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay" />
        {/* Faint decorative concentric arcs — echoes the wave logo */}
        <svg
          className="pointer-events-none absolute -right-24 top-1/2 h-[140%] w-auto -translate-y-1/2 opacity-[0.07]"
          viewBox="0 0 600 600"
          fill="none"
          aria-hidden
        >
          {[120, 180, 240, 300].map((r) => (
            <circle key={r} cx="300" cy="300" r={r} stroke="#fffefa" strokeWidth="1" />
          ))}
        </svg>
        {/* Bottom soft fade to tealDark — grounds the content */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-tealDark/40" />

        {/* Navbar — mobile: centered glass pill (logo + hamburger) / desktop: full-width glass bar (logo left, links center, CTA right) */}
        <nav className="absolute left-0 top-0 z-30 w-full safe-pt">
          {/* Desktop full-width glass bar */}
          <div className="relative hidden overflow-hidden border-b border-white/20 bg-ink/25 shadow-lg shadow-ink/30 backdrop-blur-2xl backdrop-saturate-[1.8] md:block">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 via-white/5 to-transparent" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25)]" />
            <div className="relative mx-auto flex max-w-[1400px] items-center justify-between px-8 py-3.5 lg:px-12">
              {/* Logo left */}
              <a href="#top" className="flex shrink-0 items-center gap-3">
                <img
                  src="/images/arcwave-01.png"
                  alt="Arcwave Pilates"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="hidden text-sm font-semibold uppercase tracking-[0.25em] text-paper lg:inline">
                  Arcwave Pilates
                </span>
              </a>
              {/* Links center */}
              <div className="flex items-center gap-7 lg:gap-10">
                {NAV.map((n) => (
                  <a
                    key={n.label}
                    href={n.href}
                    className="text-xs font-medium uppercase tracking-[0.18em] text-paper/80 transition-colors hover:text-paper lg:text-[13px]"
                  >
                    {n.label}
                  </a>
                ))}
              </div>
              {/* CTA right */}
              <a
                href="#booking"
                onClick={() => setTab("trial")}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-lime px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-lime/90"
              >
                Start your journey
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Mobile centered glass pill */}
          <div className="relative mx-auto flex w-full max-w-3xl items-center justify-between overflow-hidden rounded-b-2xl border border-white/25 bg-ink/25 px-4 py-2.5 shadow-lg shadow-ink/30 backdrop-blur-2xl backdrop-saturate-[1.8] md:hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-b-2xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25)]" />
            {/* Logo */}
            <a href="#top" className="relative flex shrink-0 items-center">
              <img
                src="/images/arcwave-01.png"
                alt="Arcwave Pilates"
                className="h-9 w-9 rounded-full object-cover"
              />
            </a>
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-paper transition-colors hover:bg-muted"
            >
              {menuOpen ? <Menu className="h-5 w-5 rotate-90" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu panel */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="relative mx-3 mt-1 overflow-hidden rounded-2xl border border-white/25 bg-ink/30 p-2 shadow-lg shadow-ink/30 backdrop-blur-2xl backdrop-saturate-[1.8] md:hidden"
              >
                {/* Glass sheen */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25)]" />
                {NAV.map((n) => (
                  <a
                    key={n.label}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-[44px] items-center justify-between rounded-xl px-4 py-3 text-sm font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-muted/50"
                  >
                    {n.label}
                    <ArrowRight className="h-4 w-4 -rotate-45 text-muted-foreground/80" />
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-12 pt-5 sm:px-10 sm:pb-16 md:px-16 md:pb-20 lg:px-24 lg:pb-28">
          {/* Info + CTA — on top on mobile, side-by-side on desktop */}
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-12 items-end gap-4 lg:gap-8">
            {/* Giant wordmark */}
            <div className="col-span-12 lg:col-span-7 order-2 lg:order-1">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/70 sm:text-xs"
              >
                {eyebrow}
              </motion.p>
              <h1 className="font-medium leading-[0.82] tracking-[-0.05em] text-paper text-[19vw] sm:text-[18vw] md:text-[15vw] lg:text-[12vw] xl:text-[11vw] 2xl:text-[10vw]">
                <WordsPullUp text="Arcwave" showAsterisk />
              </h1>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-serif text-xl italic text-teal sm:text-2xl md:text-3xl">
                  Pilates
                </span>
                <span className="hidden text-[10px] uppercase tracking-[0.3em] text-paper/70 sm:inline md:text-xs">
                  {subTagline}
                </span>
              </div>
            </div>

            {/* Info + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
              className="col-span-12 order-1 lg:col-span-5 lg:order-2 lg:mt-0"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[#9a742d] text-[#9a742d]"
                    />
                  ))}
                </div>
                <span className="text-xs text-paper/70">5.0 customer rating</span>
              </div>
              <p className="mt-6 text-2xl font-light leading-snug text-paper sm:text-3xl md:text-4xl">
                {tagline}
              </p>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-paper/75 sm:text-base md:text-lg">
                {description}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#booking"
                  onClick={() => setTab("trial")}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-teal px-5 text-sm font-medium text-white transition-all hover:gap-3 sm:px-6 sm:text-base"
                >
                  Book a trial
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                    <ArrowRight className="h-4 w-4 text-teal" />
                  </span>
                </a>
                <a
                  href="#about"
                  className="inline-flex h-11 items-center text-xs font-medium uppercase tracking-[0.2em] text-paper/80 underline-offset-4 hover:underline sm:text-sm"
                >
                  Explore Arcwave
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
