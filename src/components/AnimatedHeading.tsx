"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";

type Props = {
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
  /** Woord (of woorden) dat met een gekleurde markering wordt getoond, zoals in de hero. */
  highlight?: string;
};

export default function AnimatedHeading({ text, className, as = "h2", delay = 0, highlight }: Props) {
  const MotionTag = motion(as);
  const words = text.split(" ");
  const highlightWords = highlight ? highlight.split(" ") : [];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {words.map((word, i) => {
        const isHighlighted = highlightWords.includes(word.replace(/[.,]$/, ""));
        return (
          // De spatie staat hier als los broertje buiten het overflow-hidden blok — anders
          // trimt de browser hem weg als laatste karakter van dat geïsoleerde blokje.
          <span key={`${word}-${i}`}>
            <span className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "110%", opacity: 0 },
                  visible: { y: "0%", opacity: 1 },
                }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {isHighlighted ? <span className="gradient-text">{word}</span> : word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </MotionTag>
  );
}
