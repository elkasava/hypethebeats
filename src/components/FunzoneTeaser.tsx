"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";
import Sticker from "./Sticker";

const FLOATING_EMOJI = [
  { emoji: "🥁", label: "Kick & drums", className: "left-[8%] top-[12%] text-4xl sm:text-5xl", duration: 5, delay: 0 },
  { emoji: "🪇", label: "Shaker", className: "left-[20%] top-[68%] text-3xl sm:text-4xl", duration: 6, delay: 0.4 },
  { emoji: "🎹", label: "Piano", className: "left-[78%] top-[20%] text-4xl sm:text-5xl", duration: 5.5, delay: 0.2 },
  { emoji: "🎧", label: "Koptelefoon", className: "left-[88%] top-[62%] text-3xl sm:text-4xl", duration: 6.5, delay: 0.6 },
  { emoji: "🔊", label: "Subwoofer", className: "left-[52%] top-[8%] text-3xl sm:text-4xl", duration: 5.2, delay: 0.3 },
];

export default function FunzoneTeaser() {
  return (
    <section aria-label="Funzone" className="relative py-28 md:py-36">
      <div className="container-px mx-auto max-w-7xl">
        <div
          className="relative overflow-hidden rounded-lg px-8 py-14 md:px-16 md:py-20"
          style={{ background: "#111110", color: "#ffffff" }}
        >
          {/* Zachte ademende gloed op de achtergrond */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full"
            style={{ background: "radial-gradient(circle, #84cc16 0%, transparent 70%)" }}
            animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Drijvende muziek-emoji als sfeervolle decoratie */}
          {FLOATING_EMOJI.map((item) => (
            <motion.span
              key={item.label}
              aria-hidden
              className={`pointer-events-none absolute z-0 hidden select-none opacity-25 md:block ${item.className}`}
              animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
              transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
            >
              {item.emoji}
            </motion.span>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -4 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 8 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -right-4 -top-4 z-20 hidden lg:block"
          >
            <motion.div
              animate={{ rotate: [8, 14, 8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sticker shape="burst" color="#84cc16" rotate={0} size={1}>
                Probeer
                <br />
                nu
              </Sticker>
            </motion.div>
          </motion.div>

          <div className="relative z-10 max-w-2xl">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
                Funzone
              </p>
            </Reveal>

            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 font-display text-balance text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Maak nu al je eigen <span className="gradient-text">beat</span> — direct in je
              browser
            </motion.h2>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">
                De Funzone is een speeltuin met geluid: tik op de drumpads, speel de piano en
                bouw je eigen ritme. Het is een klein voorproefje van wat deelnemers écht doen
                tijdens onze workshops — beats maken, vocals opnemen en mixen, onder begeleiding
                van ervaren professionals.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <motion.a
                  href="/funzone"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-foreground transition-colors hover:brightness-105"
                >
                  Speel in de Funzone
                </motion.a>
                <motion.a
                  href="/#aanbod"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Bekijk ons aanbod
                </motion.a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
