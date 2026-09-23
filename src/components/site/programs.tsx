import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";

const PROGRAMS = [
  {
    title: "Beginner Pilates",
    desc: "New to Pilates? Our beginner sessions introduce you to the fundamental principles, breathing techniques, alignment, and basic movements of Pilates in a safe and supportive environment.",
  },
  {
    title: "Intermediate & Advanced Pilates",
    desc: "For those with prior Pilates experience, our intermediate and advanced sessions offer more challenging exercises, progressions, and sequences designed to build strength, control, endurance, balance, and body awareness.",
  },
  {
    title: "Pilates for All Ages",
    desc: "Pilates can be adapted to suit different ages, abilities, and fitness levels. Our sessions focus on safe, effective movement while helping you maintain strength, mobility, flexibility, and overall physical well-being.",
  },
  {
    title: "Classical Pilates",
    desc: "Experience the traditional Pilates method through the original principles and exercise repertoire developed by Joseph Pilates. Classical Pilates emphasizes precision, control, concentration, breathing, and a structured progression of exercises.",
  },
  {
    title: "Contemporary Pilates",
    desc: "Our contemporary approach combines the foundational principles of Pilates with modern movement science and exercise techniques. Sessions can be adapted to individual needs, goals, movement patterns, and physical abilities.",
  },
  {
    title: "Pre-Natal Pilates",
    desc: "Our pre-natal Pilates sessions are designed to support women throughout pregnancy, with appropriately modified exercises that focus on maintaining strength, mobility, posture, breathing, and body awareness.",
    note: "Pre-natal exercise should be undertaken with appropriate medical clearance and professional guidance.",
  },
  {
    title: "Post-Natal Pilates",
    desc: "Post-natal Pilates focuses on gradually rebuilding strength, mobility, stability, posture, and confidence following childbirth. Exercises can be individually modified according to your stage of recovery and specific needs.",
    note: "Post-natal exercise should be undertaken with appropriate medical clearance, particularly following complications or surgery.",
  },
  {
    title: "Rehabilitation Pilates",
    desc: "Our rehabilitation-focused Pilates sessions use controlled, mindful movement to support recovery and improve strength, mobility, stability, posture, and movement quality. Sessions are tailored to the individual's condition, abilities, and recovery goals.",
  },
];

const SERVICES = [
  {
    title: "Small Group Sessions",
    badge: "Maximum 4 members",
    desc: "Personalized Pilates in a small, supportive setting. With only four clients per session, every participant receives focused instruction, individual corrections, and appropriate modifications.",
  },
  {
    title: "Private Sessions",
    badge: "One-on-one attention",
    desc: "A completely personalized Pilates experience designed around your individual goals, abilities, and requirements. Particularly suitable for rehabilitation, older adults, beginners, pre/post-natal clients, and anyone seeking dedicated attention.",
  },
];

export function Programs() {
  return (
    <section id="programs" className="w-full bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* Intro */}
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            Our Pilates Programs
          </p>
          <h2 className="mt-5 text-3xl font-normal leading-[1.05] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Pilates for every body," },
                { text: "every stage of life.", className: "font-serif italic text-teal" },
              ]}
            />
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-ink/70 sm:text-base md:text-lg">
            At Arcwave Pilates, we believe Pilates is for every body, every age,
            and every stage of life. Our sessions are thoughtfully designed to
            help you build strength, improve flexibility, develop better
            posture, enhance body awareness, and move with greater confidence.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink/70 sm:text-base md:text-lg">
            Whether you are completely new to Pilates, an experienced
            practitioner, preparing for motherhood, or recovering from an
            injury, we offer programs tailored to your individual needs and
            fitness level.
          </p>
        </div>

        {/* Program cards grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p, i) => (
            <article
              key={i}
              className="flex flex-col rounded-2xl border border-line bg-white2 p-6 transition-colors hover:border-teal/40 md:p-7"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal/10 text-xs font-semibold text-teal">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-medium text-ink">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {p.desc}
              </p>
              {p.note && (
                <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground/80">
                  {p.note}
                </p>
              )}
            </article>
          ))}
        </div>

        {/* CTA line */}
        <div className="mt-12 rounded-2xl border border-teal/30 bg-teal/5 px-6 py-8 text-center md:px-10 md:py-10">
          <p className="text-xl font-medium text-ink md:text-2xl lg:text-3xl">
            Move Better. Feel Stronger.{" "}
            <span className="font-serif italic text-teal">Live Better.</span>
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Whether your goal is to improve fitness, develop strength and
            flexibility, support your pregnancy journey, recover from an
            injury, or simply feel better in your body, our Pilates programs
            are designed to meet you where you are and help you progress with
            confidence.
          </p>
        </div>

        {/* Services we provide */}
        <div className="mt-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            Services we provide
          </p>
          <h3 className="mt-4 text-2xl font-normal text-ink md:text-3xl lg:text-4xl">
            Two ways to practise
          </h3>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SERVICES.map((s, i) => (
              <article
                key={i}
                className="flex flex-col rounded-2xl border border-line bg-muted p-6 md:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xl font-medium text-ink md:text-2xl">
                    {s.title}
                  </h4>
                  <span className="shrink-0 rounded-full bg-teal/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-teal">
                    {s.badge}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {s.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
