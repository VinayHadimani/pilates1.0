import { DAY_LABELS } from "@/lib/site";
import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import type { Prisma } from "@prisma/client";

type Slot = Prisma.ClassSlotGetPayload<Record<string, never>>;

export function Schedule({ slots }: { slots: Slot[] }) {
  const byDay: Record<number, Slot[]> = {};
  for (const s of slots) (byDay[s.dayOfWeek] ||= []).push(s);
  const days = [1, 2, 3, 4, 5, 6]; // Mon–Sat

  return (
    <section
      id="schedule"
      className="relative w-full overflow-hidden bg-black px-4 py-20 md:px-6 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary sm:text-xs">
            Weekly Schedule
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-[#E1E0CC] sm:text-4xl md:text-5xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Find your slot," },
                { text: "every week.", className: "font-serif italic" },
              ]}
            />
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((d) => (
            <div
              key={d}
              className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/70">
                {DAY_LABELS[d]}
              </p>
              <div className="mt-4 space-y-2.5">
                {(byDay[d] || []).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#E1E0CC]">
                        {s.className}
                      </p>
                      <p className="text-[11px] text-primary/50">
                        {s.startTime}
                        {s.endTime ? ` – ${s.endTime}` : ""} · cap {s.capacity}
                      </p>
                    </div>
                  </div>
                ))}
                {!(byDay[d] && byDay[d].length) && (
                  <p className="px-1 text-xs text-primary/40">Closed this day</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
