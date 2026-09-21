import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import { Instagram } from "lucide-react";

const FAQS = [
  {
    q: "I'm new to Pilates. Can I book a trial?",
    a: "Absolutely. Tell the team you're a beginner and share what you'd like to work towards. They can help you understand the right starting point before you book. Use the Trial tab above — it only takes a moment.",
  },
  {
    q: "Do I need to be flexible already?",
    a: "You don't need to arrive with advanced moves. Pilates is a practice of learning control and movement. Discuss your experience and needs with the instructor first.",
  },
  {
    q: "How do memberships and carry-forward work?",
    a: "Memberships run for 1, 3 or 6 months with twice or thrice a week options. Choose your weekly slots and we lock your recurring calendar. Unused classes carry forward — up to 5, 15 or 28 classes depending on your plan. You can reschedule any session instantly from the Manage tab.",
  },
  {
    q: "Where is the studio?",
    a: "Arcwave Pilates is in Thiruvanmiyur, Chennai. Ask the team for the exact studio pin and arrival details when arranging your visit.",
  },
];

export function Faq({ instagramUrl }: { instagramUrl: string }) {
  return (
    <section
      id="faq"
      className="relative w-full overflow-hidden bg-black px-4 py-20 md:px-6 md:py-28"
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary sm:text-xs">
          A little clarity
        </p>
        <h2 className="mt-6 text-3xl font-normal leading-[0.95] tracking-tight text-[#E1E0CC] sm:text-4xl md:text-5xl">
          <WordsPullUpMultiStyle
            segments={[
              { text: "Before your" },
              { text: "first visit.", className: "font-serif italic" },
            ]}
          />
        </h2>

        <Accordion type="single" collapsible defaultValue="item-0" className="mt-10">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-white/10"
            >
              <AccordionTrigger className="text-left text-base font-medium text-[#E1E0CC] hover:text-primary sm:text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-primary/60 sm:text-base">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-[#0e0e0e] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#E1E0CC]">
              Still curious? Our team is a message away.
            </p>
            <p className="mt-1 text-xs text-primary/50">
              DM us on Instagram — we usually reply within a few hours.
            </p>
          </div>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-105"
          >
            <Instagram className="h-4 w-4" />
            Ask us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
