"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { mentors } from "@/lib/content";
import Reveal from "./Reveal";

const tracks = mentors.flatMap((m) =>
  m.tracks.map((t) => ({ mentor: m.name, photo: m.photo, role: m.role, ...t }))
);

export default function MentorTracks() {
  return (
    <section id="tracks" aria-label="Muziek van onze mentoren" className="bg-surface-2 py-24 md:py-32">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
                Uit de praktijk
              </p>
            </Reveal>
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 font-display text-balance text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Songs waar onze <span className="gradient-text">mentoren</span> aan werkten
            </motion.h2>
          </div>
          <Reveal delay={0.16}>
            <p className="max-w-sm text-base leading-relaxed text-muted lg:text-right">
              Onze gastmentoren staan met één been in de muziekindustrie. Beluister hun releases en
              hoor met wie de deelnemers werken.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t, i) => (
            <Reveal key={t.url} delay={i * 0.06}>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_40px_rgba(99,91,255,0.12)]"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  <Image
                    src={t.photo}
                    alt={t.mentor}
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-lg font-bold tracking-tight">{t.title}</h3>
                  <p className="truncate text-xs uppercase tracking-widest text-muted">{t.mentor}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-[#111110] transition-transform duration-300 group-hover:scale-110"
                >
                  ▶
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted">
          Beluister opent de track op Spotify in een nieuw tabblad.
        </p>
      </div>
    </section>
  );
}
