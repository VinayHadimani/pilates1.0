import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import type { Prisma } from "@prisma/client";

type Trainer = Prisma.TrainerGetPayload<Record<string, never>>;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Trainers({ trainers }: { trainers: Trainer[] }) {
  const active = trainers.filter((t) => t.isActive);
  if (active.length === 0) return null;

  return (
    <section
      id="trainers"
      className="relative w-full overflow-hidden bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            Meet our team
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-ink sm:text-4xl md:text-5xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Guided by experts who" },
                { text: "care.", className: "font-serif italic text-teal" },
              ]}
            />
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
            Every instructor at Arcwave is internationally trained and
            genuinely invested in how your body moves — meeting you where you
            are, every single session.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((t) => {
            const specialities = (t.specialities || "")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            return (
              <article
                key={t.id}
                className="group flex flex-col rounded-2xl border border-line bg-white2 p-6 transition-colors hover:border-teal/40 md:p-8"
              >
                <div className="flex items-center gap-4">
                  {t.imageUrl ? (
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-lime/40 text-xl font-medium text-teal">
                      {initials(t.name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-medium text-ink">
                      {t.name}
                    </h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-teal">
                      {t.title}
                    </p>
                  </div>
                </div>

                {t.bio && (
                  <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                    {t.bio}
                  </p>
                )}

                {specialities.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {specialities.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex rounded-full bg-muted px-3 py-1 text-xs text-ink"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
