"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  delay?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function WordsPullUp({
  text,
  className = "",
  showAsterisk = false,
  delay = 0,
}: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline ${className}`}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: 20, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{
                duration: 0.7,
                delay: delay + i * 0.08,
                ease: EASE,
              }}
            >
              {word}
              {isLast && showAsterisk && (
                <span className="relative">
                  <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] leading-none">
                    *
                  </span>
                </span>
              )}
              {!isLast ? "\u00A0" : ""}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
