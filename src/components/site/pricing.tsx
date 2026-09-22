import { Badge } from "@/components/ui/badge";
import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import { BookButton } from "@/components/site/book-button";
import { formatINR } from "@/lib/site";
import type { Prisma } from "@prisma/client";

type Plan = Prisma.PricingPlanGetPayload<Record<string, never>>;

export function Pricing({ plans }: { plans: Plan[] }) {
  const memberships = plans.filter((p) => p.type === "membership");
  const daily = plans.find((p) => p.type === "daily");

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

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((p) => {
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
                    <Badge className="bg-teal text-white hover:bg-tealDark">
                      Most popular
                    </Badge>
                  </div>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                  {p.durationMonths} {p.durationMonths === 1 ? "month" : "months"} ·{" "}
                  {p.frequency === "thrice" ? "Thrice / week" : "Twice / week"}
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
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal/60" />
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

        {/* Drop-in daily */}
        {daily && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border border-line bg-muted p-6 md:flex-row md:p-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                Just visiting?
              </p>
              <h3 className="mt-2 text-2xl font-medium text-ink md:text-3xl">
                {daily.tagline || daily.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Single class · any available slot · {formatINR(daily.price)}
              </p>
            </div>
            <a
              href="#booking"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-teal/40 px-6 py-3 text-sm font-medium text-teal transition-all hover:gap-3 hover:bg-tealDark hover:text-white"
            >
              Book a class
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
