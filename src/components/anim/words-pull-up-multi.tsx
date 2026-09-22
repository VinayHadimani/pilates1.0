"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  delay?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function WordsPullUpMultiStyle({
  segments,
  className = "",
  delay = 0,
}: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  // Build a flat list of words preserving each segment's className
  const items: { word: string; className?: string }[] = [];
  for (const seg of segments) {
    const words = seg.text.split(" ");
    for (const w of words) {
      items.push({ word: w, className: seg.className });
    }
  }

  return (
    <span
      ref={ref}
      className={`inline-flex flex-wrap justify-center ${className}`}
    >
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span
            className={`inline-block ${item.className ?? ""}`}
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.08,
              ease: EASE,
            }}
          >
            {item.word}
            {i < items.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
