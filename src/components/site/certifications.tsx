import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import { Award, BadgeCheck } from "lucide-react";
import type { Prisma } from "@prisma/client";

type Certificate = Prisma.CertificateGetPayload<Record<string, never>>;

export function Certifications({
  certificates,
  founderName,
}: {
  certificates: Certificate[];
  founderName: string;
}) {
  const active = certificates.filter((c) => c.isActive);
  if (active.length === 0) return null;

  return (
    <section
      id="certifications"
      className="relative w-full overflow-hidden bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            <BadgeCheck className="h-4 w-4" />
            Certifications &amp; Qualifications
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-ink sm:text-4xl md:text-5xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Trusted expertise," },
                { text: "internationally recognised.", className: "font-serif italic text-teal" },
              ]}
            />
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
            {founderName} brings together classical and contemporary Pilates
            training from some of the most respected schools in the world.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((c) => (
            <article
              key={c.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white2 p-6 transition-colors hover:border-teal/40 md:p-8"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime/60 text-teal">
                  <Award className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/40">
                  {c.year}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-medium leading-snug text-ink sm:text-xl">
                {c.title}
              </h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-teal">
                {c.issuer}
              </p>

              {c.description && (
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              )}

              {c.imageUrl && (
                <div className="mt-5 overflow-hidden rounded-xl border border-line">
                  <img
                    src={c.imageUrl}
                    alt={`${c.title} — ${c.issuer}`}
                    className="h-32 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
