import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import { formatINR } from "@/lib/site";
import type { Prisma } from "@prisma/client";

type Plan = Prisma.PricingPlanGetPayload<Record<string, never>>;

type Freq = "twice" | "thrice";
type Cat = "group" | "private";

const DURATIONS = [
  { months: 1, label: "1 Month" },
  { months: 3, label: "3 Months" },
  { months: 6, label: "6 Months" },
];

const COLUMNS: { category: Cat; frequency: Freq; label: string }[] = [
  { category: "group", frequency: "twice", label: "Group 2×/week" },
  { category: "group", frequency: "thrice", label: "Group 3×/week" },
  { category: "private", frequency: "twice", label: "Private 2×/week" },
  { category: "private", frequency: "thrice", label: "Private 3×/week" },
];

function findPlan(
  plans: Plan[],
  category: Cat,
  frequency: Freq,
  months: number
): Plan | undefined {
  return plans.find(
    (p) =>
      p.type === "membership" &&
      p.category === category &&
      p.frequency === frequency &&
      p.durationMonths === months
  );
}

export function PlanComparison({ plans }: { plans: Plan[] }) {
  // Only need membership plans for the table
  const memberships = plans.filter((p) => p.type === "membership");
  if (memberships.length === 0) return null;

  // Drop-in cards (Group / Private) — fallback to seeded defaults
  const groupDrop = plans.find(
    (p) => p.type === "daily" && p.category === "group"
  );
  const privateDrop = plans.find(
    (p) => p.type === "daily" && p.category === "private"
  );
  const groupDropPrice = groupDrop?.price ?? 1700;
  const privateDropPrice = privateDrop?.price ?? 2700;

  return (
    <section
      id="plan-comparison"
      className="relative w-full overflow-hidden bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            Find your fit
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-ink sm:text-4xl md:text-5xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Compare" },
                { text: "plans.", className: "font-serif italic text-teal" },
              ]}
            />
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
            One glance at every membership option — group and private, across
            every duration and frequency. Prices update live with admin
            changes, so what you see is what you pay.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[760px] overflow-hidden rounded-2xl border border-line bg-white2 text-left">
            <thead>
              <tr className="bg-muted">
                <th
                  scope="col"
                  className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wider text-teal md:px-6 md:py-5"
                >
                  Duration
                </th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.label}
                    scope="col"
                    className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wider text-teal md:px-6 md:py-5"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DURATIONS.map((d, idx) => (
                <tr
                  key={d.months}
                  className={
                    idx % 2 === 1 ? "bg-muted/40" : "bg-transparent"
                  }
                >
                  <th
                    scope="row"
                    className="px-4 py-5 text-sm font-medium text-ink md:px-6 md:py-6"
                  >
                    {d.label}
                  </th>
                  {COLUMNS.map((c) => {
                    const plan = findPlan(
                      memberships,
                      c.category,
                      c.frequency,
                      d.months
                    );
                    return (
                      <td
                        key={c.label}
                        className="px-4 py-5 text-sm font-semibold text-ink md:px-6 md:py-6"
                      >
                        {plan ? formatINR(plan.price) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Drop-in cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-muted p-6 md:p-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                Drop-in · Group
              </p>
              <h3 className="mt-2 text-2xl font-medium text-ink md:text-3xl">
                {formatINR(groupDropPrice)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Single group session · any available slot
              </p>
            </div>
            <a
              href="#booking"
              className="group inline-flex items-center gap-2 self-start rounded-full border border-teal/40 px-5 py-2.5 text-sm font-medium text-teal transition-all hover:gap-3 hover:bg-teal hover:text-white"
            >
              Book a class
            </a>
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-muted p-6 md:p-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                Drop-in · Private
              </p>
              <h3 className="mt-2 text-2xl font-medium text-ink md:text-3xl">
                {formatINR(privateDropPrice)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Single 1:1 session · personalised programming
              </p>
            </div>
            <a
              href="#booking"
              className="group inline-flex items-center gap-2 self-start rounded-full border border-teal/40 px-5 py-2.5 text-sm font-medium text-teal transition-all hover:gap-3 hover:bg-teal hover:text-white"
            >
              Book a class
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
