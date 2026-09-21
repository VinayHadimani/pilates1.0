import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import { AnimatedText } from "@/components/anim/animated-letters";

export function About({
  eyebrow,
  aboutDesc,
  founderName,
  founderTitle,
  founderYears,
  founderYearsLabel,
  founderPurpose,
  founderPurposeLabel,
}: {
  eyebrow: string;
  aboutDesc: string;
  founderName: string;
  founderTitle: string;
  founderYears: string;
  founderYearsLabel: string;
  founderPurpose: string;
  founderPurposeLabel: string;
}) {
  return (
    <section id="about" className="w-full bg-black px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl rounded-3xl bg-[#101010] px-6 py-16 text-center md:px-12 md:py-24">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary sm:text-xs">
          {eyebrow}
        </p>

        <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-[#E1E0CC] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl">
          <WordsPullUpMultiStyle
            segments={[
              { text: "I am Niranjan," },
              { text: "an internationally certified expert.", className: "font-serif italic" },
              { text: "Guiding mindful movement for over seven years." },
            ]}
          />
        </h2>

        <div className="mx-auto mt-10 max-w-2xl">
          <AnimatedText
            text={aboutDesc}
            className="text-[#DEDBC8] text-xs leading-relaxed sm:text-sm md:text-base"
          />
        </div>

        <div className="mx-auto mt-14 flex max-w-4xl flex-col items-center gap-10 md:flex-row md:items-stretch md:justify-center">
          <div className="relative w-full max-w-xs overflow-hidden rounded-2xl">
            <img
              src="/images/arcwave-04.png"
              alt={`Meet ${founderName}, founder of Arcwave Pilates`}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
              <p className="font-serif text-xl italic text-[#DEDBC8]">{founderName}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-primary/60">
                {founderTitle}
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-6 md:flex-col md:gap-8">
            <div className="text-left md:text-left">
              <p className="text-4xl font-medium text-[#E1E0CC] md:text-6xl">
                {founderYears}
              </p>
              <p className="mt-2 max-w-[12rem] text-xs text-primary/60 sm:text-sm">
                {founderYearsLabel}
              </p>
            </div>
            <div className="text-left">
              <p className="font-serif text-3xl italic text-[#DEDBC8] md:text-5xl">
                {founderPurpose}
              </p>
              <p className="mt-2 max-w-[12rem] text-xs text-primary/60 sm:text-sm">
                {founderPurposeLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
