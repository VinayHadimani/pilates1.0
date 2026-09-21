"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

/** Scroll-linked character opacity reveal. */
export function AnimatedText({ text, className = "" }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll(ref, {
    offset: ["start 0.8", "end 0.2"],
  });

  const chars = Array.from(text);
  const total = chars.length;

  return (
    <p ref={ref} className={className}>
      {chars.map((ch, i) => (
        <AnimatedLetter
          key={i}
          char={ch}
          index={i}
          total={total}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
}

function AnimatedLetter({
  char,
  index,
  total,
  progress,
}: {
  char: string;
  index: number;
  total: number;
  progress: any;
}) {
  const charProgress = index / total;
  const opacity = useTransform(
    progress,
    [charProgress - 0.1, charProgress + 0.05],
    [0.2, 1]
  );

  if (char === " ") {
    return <motion.span style={{ opacity }}>{" "}</motion.span>;
  }
  if (char === "\n") {
    return <br />;
  }
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}
