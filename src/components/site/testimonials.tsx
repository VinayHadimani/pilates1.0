"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  title?: string | null;
  body: string;
  source?: string;
  googleUrl?: string | null;
}

interface FallbackTestimonial {
  quote: string;
  name: string;
  since: string;
}

const FALLBACK_TESTIMONIALS: FallbackTestimonial[] = [
  {
    quote:
      "I came in with chronic back pain and left with a practice that changed how I move every day. Niranjan's cues are precise and patient.",
    name: "Priya S.",
    since: "Member since 2024",
  },
  {
    quote:
      "The reformer sessions are the best part of my week. Small group, personal attention, and I can feel my core getting stronger.",
    name: "Arjun M.",
    since: "Member since 2023",
  },
  {
    quote:
      "After my pregnancy, I was looking for something gentle but effective. Arcwave gave me my strength back, one session at a time.",
    name: "Deepa R.",
    since: "Member since 2024",
  },
  {
    quote:
      "I've tried other studios — none compare. The space is calm, the teaching is world-class, and the community is real.",
    name: "Karthik V.",
    since: "Member since 2022",
  },
  {
    quote:
      "My private sessions with Niranjan transformed my posture and my confidence. Worth every rupee.",
    name: "Lakshmi N.",
    since: "Member since 2024",
  },
  {
    quote:
      "From a trial session to a 6-month membership — I was hooked from day one. Best decision for my body.",
    name: "Rohan K.",
    since: "Member since 2023",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, s) => (
        <Star
          key={s}
          fill={s < rating ? "#9a742d" : "transparent"}
          color="#9a742d"
          className="h-4 w-4"
          strokeWidth={s < rating ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

export function Testimonials({ reviews = [] }: { reviews?: ReviewItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, margin: "-100px" });
  const hasReviews = reviews.length > 0;

  return (
    <section
      id="testimonials"
      className="relative w-full overflow-hidden bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            What our members say
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-ink sm:text-4xl md:text-5xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Stories of strength and" },
                {
                  text: "flow.",
                  className: "font-serif italic text-teal",
                },
              ]}
            />
          </h2>
        </div>

        {hasReviews ? (
          <div
            ref={gridRef}
            className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:mt-16"
          >
            {reviews.map((r, i) => (
              <motion.article
                key={r.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={
                  inView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }
                }
                transition={{
                  duration: 0.7,
                  delay: i * 0.15,
                  ease: EASE,
                }}
                className="flex h-full flex-col rounded-2xl border border-line bg-white2 p-6 md:p-8"
              >
                <div className="flex items-center justify-between gap-2">
                  <Stars rating={r.rating} />
                  {r.source === "google" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                      Google
                    </span>
                  )}
                </div>

                {r.title && (
                  <p className="mt-5 text-base font-semibold text-ink">
                    {r.title}
                  </p>
                )}

                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/80">
                  &ldquo;{r.body}&rdquo;
                </p>

                <footer className="mt-6 border-t border-line pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{r.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Member review
                      </p>
                    </div>
                    {r.googleUrl && (
                      <a
                        href={r.googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-teal underline-offset-4 hover:underline"
                      >
                        View on Google →
                      </a>
                    )}
                  </div>
                </footer>
              </motion.article>
            ))}
          </div>
        ) : (
          <div
            ref={gridRef}
            className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:mt-16"
          >
            {FALLBACK_TESTIMONIALS.map((t, i) => (
              <motion.article
                key={i}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={
                  inView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }
                }
                transition={{
                  duration: 0.7,
                  delay: i * 0.15,
                  ease: EASE,
                }}
                className="flex h-full flex-col rounded-2xl border border-line bg-white2 p-6 md:p-8"
              >
                <Stars rating={5} />

                <p className="mt-5 flex-1 text-sm leading-relaxed text-ink/80">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <footer className="mt-6 border-t border-line pt-4">
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.since}</p>
                </footer>
              </motion.article>
            ))}
          </div>
        )}

        {/* Write a review button */}
        <div className="mt-12 text-center">
          <a
            href="#review"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-teal px-7 text-sm font-medium text-white transition-all hover:gap-3"
          >
            Write a review
          </a>
        </div>
      </div>
    </section>
  );
}
