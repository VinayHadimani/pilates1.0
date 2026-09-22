"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import { BookButton } from "@/components/site/book-button";
import { formatINR } from "@/lib/site";
import type { Prisma } from "@prisma/client";

type Plan = Prisma.PricingPlanGetPayload<Record<string, never>>;

export function Pricing({ plans }: { plans: Plan[] }) {
  const memberships = plans.filter((p) => p.type === "membership");
  const daily = plans.filter((p) => p.type === "daily");
  const [tab, setTab] = useState<"group" | "private">("group");

  const visible = memberships.filter((p) => p.category === tab);

  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            Membership & Pricing
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Plans that move", className: "" },
                { text: "with your practice.", className: "font-serif italic" },
              ]}
            />
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
            Choose a membership that fits your rhythm. Prices, class counts and
            carry-forward are all managed live — no surprises.
          </p>
        </div>

        {/* Group / Private toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex gap-1 rounded-full border border-line bg-muted p-1.5">
            <button
              type="button"
              onClick={() => setTab("group")}
              className={`min-h-[44px] rounded-full px-6 text-sm font-semibold transition-colors ${
                tab === "group"
                  ? "bg-teal text-white"
                  : "text-ink hover:text-teal"
              }`}
            >
              Group Sessions
            </button>
            <button
              type="button"
              onClick={() => setTab("private")}
              className={`min-h-[44px] rounded-full px-6 text-sm font-semibold transition-colors ${
                tab === "private"
                  ? "bg-teal text-white"
                  : "text-ink hover:text-teal"
              }`}
            >
              Private Sessions
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => {
            const features = (p.features || "")
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean);
            return (
              <div
                key={p.id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-colors sm:p-6 md:p-8 ${
                  p.isFeatured
                    ? "border-teal/40 bg-white2"
                    : "border-line bg-muted hover:border-teal/40"
                }`}
              >
                {p.isFeatured && (
                  <div className="absolute right-4 top-4">
                    <Badge className="bg-lime text-ink hover:bg-lime">
                      Most popular
                    </Badge>
                  </div>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                  {p.durationMonths} {p.durationMonths === 1 ? "month" : "months"} ·{" "}
                  {p.frequency === "thrice" ? "3× / week" : "2× / week"}
                </p>
                <h3 className="mt-3 text-2xl font-medium text-ink md:text-3xl">
                  {p.tagline || p.name}
                </h3>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-teal md:text-5xl">
                    {formatINR(p.price)}
                  </span>
                  {p.oldPrice && (
                    <span className="text-base text-muted-foreground line-through">
                      {formatINR(p.oldPrice)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground/80">
                  {p.totalClasses} sessions ·{" "}
                  {p.classesPerWeek}× per week
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                      <span className="text-ink/80">{f}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal/50" />
                    <span className="text-muted-foreground">
                      Carry forward up to {p.carryForward} classes
                      {p.bonusClasses > 0 && ` · ${p.bonusClasses} bonus`}
                    </span>
                  </li>
                </ul>

                <div className="mt-8">
                  <BookButton planId={p.id} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Drop-in sessions */}
        {daily.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {daily.map((d) => (
              <div
                key={d.id}
                className="flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-line bg-muted p-6 md:flex-row md:items-center md:p-8"
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                    {d.category === "private" ? "Drop-in · Private" : "Drop-in · Group"}
                  </p>
                  <h3 className="mt-2 text-2xl font-medium text-ink md:text-3xl">
                    {d.tagline || d.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Single {d.category} session · {formatINR(d.price)}
                  </p>
                </div>
                <a
                  href="/signup"
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-teal/40 px-6 py-3 text-sm font-medium text-teal transition-all hover:gap-3 hover:bg-teal hover:text-white"
                >
                  Book a class
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
