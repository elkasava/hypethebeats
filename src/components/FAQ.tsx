"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { faqs } from "@/lib/content";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import Sticker from "./Sticker";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" aria-label="Veelgestelde vragen" className="relative py-28 md:py-36">
      <Sticker shape="square" color="#ff5da2" rotate={-7} size={1.3} className="absolute left-4 top-20 z-20 hidden lg:block">
        Funk
      </Sticker>
      <div className="container-px mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
                Veelgestelde vragen
              </p>
            </Reveal>
            <AnimatedHeading
              text="Alles wat u wilt weten voordat u start"
              className="mt-4 font-display text-balance text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            />
          </div>
          <Reveal delay={0.16}>
            <a
              href="#contact"
              className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-black/5"
            >
              Nog een vraag? Neem contact op →
            </a>
          </Reveal>
        </div>

        <div className="mt-14 divide-y divide-border border-y border-border">
          {faqs.map((faq, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={faq.question} delay={i * 0.04}>
                <div>
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    className="flex w-full items-center justify-between gap-6 py-7 text-left"
                  >
                    <span className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-all duration-300 ${
                        open
                          ? "rotate-45 border-transparent bg-accent text-foreground"
                          : "border-border text-muted"
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-button-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-7 max-w-2xl text-base leading-relaxed text-muted">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
