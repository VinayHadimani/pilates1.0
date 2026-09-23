"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { WordsPullUpMultiStyle } from "@/components/anim/words-pull-up-multi";
import type { Prisma } from "@prisma/client";

type GalleryImage = Prisma.GalleryImageGetPayload<Record<string, never>>;

// Predefined tile spans for a balanced mosaic. Index 0 = hero (large),
// the remaining tiles flow naturally. Extra tiles wrap to a normal cell.
const SPANS = [
  "lg:col-span-2 lg:row-span-2",
  "",
  "",
  "lg:col-span-2",
];

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      id="studio-gallery"
      className="relative w-full overflow-hidden bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            The Studio
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-ink sm:text-4xl md:text-5xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "A space for" },
                { text: "purposeful movement.", className: "font-serif italic" },
              ]}
            />
          </h2>
        </div>

        <div className="mt-12 grid auto-rows-[200px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setActive(i)}
              className={`group relative overflow-hidden rounded-2xl ${SPANS[i % SPANS.length] ?? ""}`}
            >
              <img
                src={image.imageUrl}
                alt={image.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="noise-overlay pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              {image.caption && (
                <p className="absolute bottom-4 left-4 right-4 text-left text-sm font-medium text-paper md:text-base">
                  {image.caption}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active !== null && images[active] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          >
            <button
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-paper hover:bg-white2/90"
              onClick={() => setActive(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={images[active].imageUrl}
              alt={images[active].title}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
