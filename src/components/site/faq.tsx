import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import { Instagram } from "lucide-react";
import type { Prisma } from "@prisma/client";

type FaqEntry = Prisma.FaqEntryGetPayload<Record<string, never>>;

export function Faq({
  faqs,
  instagramUrl,
}: {
  faqs: FaqEntry[];
  instagramUrl: string;
}) {
  return (
    <section
      id="faq"
      className="relative w-full overflow-hidden bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
          A little clarity
        </p>
        <h2 className="mt-6 text-3xl font-normal leading-[0.95] tracking-tight text-ink sm:text-4xl md:text-5xl">
          <WordsPullUpMultiStyle
            segments={[
              { text: "Before your" },
              { text: "first visit.", className: "font-serif italic" },
            ]}
          />
        </h2>

        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="mt-10"
        >
          {faqs.map((faq, i) => (
            <AccordionItem
              key={faq.id}
              value={`item-${i}`}
              className="border-line"
            >
              <AccordionTrigger className="text-left text-base font-medium text-ink hover:text-teal sm:text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground sm:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-line bg-muted p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">
              Still curious? Our team is a message away.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              DM us on Instagram — we usually reply within a few hours.
            </p>
          </div>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            <Instagram className="h-4 w-4" />
            Ask us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
