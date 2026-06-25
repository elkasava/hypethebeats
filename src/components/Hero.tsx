"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section id="top" className="relative flex flex-col overflow-hidden pt-24 pb-12 md:h-full md:pb-0 md:pt-28">
      <div className="noise-overlay z-0" />

      <div className="container-px relative z-10 mx-auto max-w-7xl">
        {/* 2-koloms grid in gulden-snede-verhouding (1.618 : 1) */}
        <div className="mt-10 grid items-center gap-10 lg:mt-16 lg:grid-cols-[1.618fr_1fr] lg:gap-16">

          {/* ── LEFT: copy ── */}
          <div>
            {/* Overline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-7 inline-flex items-center gap-2.5 rounded-md border border-accent-2/30 bg-accent-2/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-2" />
              Voor gemeenten, scholen, zorg &amp; particulieren
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(3rem,7vw,7rem)] font-extrabold leading-[0.94] tracking-tight"
            >
              Muziek die
              <br />
              <span className="gradient-text">mensen</span>
              <br />
              samenbrengt.
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 max-w-lg text-lg leading-relaxed text-muted"
            >
              Hype The Beats ontwerpt en verzorgt muziekworkshops met meetbare impact — voor
              klaslokalen, zorglocaties, jongerencentra en publieke ruimtes.
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:scale-[1.03] hover:brightness-105"
              >
                Vraag een offerte aan
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#aanbod"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-black/5"
              >
                Bekijk ons aanbod
              </a>
            </motion.div>
          </div>

          {/* ── RIGHT: video ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full lg:max-w-[360px] lg:translate-y-10 lg:justify-self-end"
          >
            <div
              className="relative aspect-[9/16] w-full overflow-hidden bg-surface-2"
              style={{ borderRadius: "42% 58% 63% 37% / 41% 44% 56% 59%" }}
            >
              <video
                src="/hero.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

              {/* Funzone-knop onderaan de blob-video */}
              <a
                href="/funzone"
                className="group absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-[#111110] shadow-lg ring-1 ring-black/10 transition-all duration-300 hover:-translate-x-1/2 hover:-translate-y-0.5 hover:brightness-105"
              >
                <span className="text-base transition-transform duration-300 group-hover:scale-125" aria-hidden="true">
                  🎮
                </span>
                Funzone — speel mee
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 mt-auto border-t border-border bg-surface/40"
        aria-label="Kerncijfers"
      >
        <div className="container-px mx-auto max-w-7xl">
          <div className="grid grid-cols-2 divide-x divide-border py-8">
            {[
              { value: "1.800+", label: "deelnemers bereikt" },
              { value: "97%", label: "zou ons aanbevelen" },
            ].map((s) => (
              <div key={s.label} className="px-8 first:pl-0 last:pr-0">
                <p className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
