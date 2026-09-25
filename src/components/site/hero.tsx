"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Star, Menu, X } from "lucide-react";
import { WordsPullUp } from "@/components/anim/words-pull-up";
import { useBookingStore } from "@/lib/booking-store";

const NAV = [
  { label: "Our story", href: "#about" },
  { label: "The studio", href: "#studio" },
  { label: "Programs", href: "#programs" },
  { label: "Certifications", href: "#certifications" },
  { label: "Membership", href: "#pricing" },
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
      <div className="relative h-full min-h-[100svh] w-full overflow-hidden rounded-2xl bg-ink md:rounded-[2rem]">
        {/* Background image — the Cadillac photo */}
        <img
          src="/images/landing-hero.jpg"
          alt="Two practitioners on the Cadillac apparatus at Arcwave studio"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark gradient overlays for text readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink/85" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-ink/40" />
        {/* Subtle noise texture */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay" />

        {/* Navbar — mobile: glass pill (logo + hamburger) / desktop: full-width glass bar */}
        <nav className="absolute left-0 top-0 z-30 w-full safe-pt">
          {/* Desktop full-width glass bar */}
          <div className="relative hidden overflow-hidden border-b border-white/20 bg-ink/25 shadow-lg shadow-ink/30 backdrop-blur-2xl backdrop-saturate-[1.8] md:block">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 via-white/5 to-transparent" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25)]" />
            <div className="relative mx-auto flex max-w-[1400px] items-center justify-between px-8 py-3 lg:px-16">
              {/* Logo left */}
              <a href="#top" className="flex shrink-0 items-center gap-3">
                <img
                  src="/images/arcwave-01.png"
                  alt="Arcwave Pilates"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-paper">
                  Arcwave Pilates
                </span>
              </a>
              {/* Links center */}
              <div className="flex items-center gap-8 lg:gap-12">
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
              {/* Book a session button right */}
              <div className="flex shrink-0 items-center gap-4">
                <a
                  href="/book"
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-lime px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-lime/90"
                >
                  Book a session
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
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
                {/* Book a session button */}
                <div className="mt-2 border-t border-white/15 pt-2">
                  <a
                    href="/book"
                    onClick={() => setMenuOpen(false)}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-lime px-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-lime/90"
                  >
                    Book a session
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-10 pt-5 sm:px-10 sm:pb-14 md:px-16 md:pb-20 lg:px-24 lg:pb-28">
          {/* Info + CTA — on top on mobile, side-by-side on desktop */}
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-12 items-end gap-2 lg:gap-8">
            {/* Giant wordmark */}
            <div className="col-span-12 lg:col-span-7 order-2 lg:order-1">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-paper/70 sm:text-xs"
              >
                {eyebrow}
              </motion.p>
              <h1 className="font-medium leading-[0.85] tracking-[-0.05em] text-paper text-[16vw] sm:text-[18vw] md:text-[15vw] lg:text-[12vw] xl:text-[11vw] 2xl:text-[10vw]">
                <WordsPullUp text="Arcwave" showAsterisk />
              </h1>
              <div className="mt-1.5 flex items-baseline gap-3">
                <span className="font-serif text-lg italic text-teal sm:text-2xl md:text-3xl">
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
              className="col-span-12 order-1 mb-4 lg:col-span-5 lg:order-2 lg:mb-0"
            >
              <p className="mt-4 text-xl font-light leading-snug text-paper sm:text-3xl md:text-4xl">
                {tagline}
              </p>
              <p className="mt-3 max-w-lg text-xs leading-relaxed text-paper/75 sm:text-base md:text-lg">
                {description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <a
                  href="/signup"
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-teal px-4 text-xs font-medium text-white transition-all hover:gap-3 sm:h-12 sm:px-6 sm:text-base"
                >
                  Book a trial
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-paper transition-transform group-hover:scale-110 sm:h-9 sm:w-9 sm:h-10 sm:w-10">
                    <ArrowRight className="h-3.5 w-3.5 text-teal sm:h-4 sm:w-4" />
                  </span>
                </a>
                <a
                  href="#about"
                  className="inline-flex h-10 items-center text-[11px] font-medium uppercase tracking-[0.2em] text-paper/80 underline-offset-4 hover:underline sm:h-11 sm:text-sm"
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
