import Image from "next/image";
import { offerings } from "@/lib/content";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import Sticker from "./Sticker";

// Spotify Wrapped-stijl harde kleurblokken; laatste zwart zodat het aansluit op de donkere balk eronder
const palette = [
  { bg: "#84cc16", fg: "#111110" }, // lime
  { bg: "#2563eb", fg: "#ffffff" }, // blauw
  { bg: "#ff5da2", fg: "#111110" }, // roze
  { bg: "#111110", fg: "#ffffff" }, // zwart
];

export default function Offerings() {
  return (
    <section id="aanbod" aria-label="Ons aanbod" className="relative py-28 md:py-36">
      <Sticker shape="pill" color="#84cc16" rotate={-9} size={1.3} className="absolute left-3 top-16 z-20 hidden lg:block">
        Good vibes
      </Sticker>
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
                Ons aanbod
              </p>
            </Reveal>
            <AnimatedHeading
              text="Programma's op maat voor elke doelgroep"
              className="mt-4 font-display text-balance text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            />
          </div>
          <Reveal delay={0.16}>
            <p className="max-w-sm text-base leading-relaxed text-muted lg:text-right">
              Wij koppelen je direct aan ervaren professionals uit het vak en leveren echt
              maatwerk — inclusief 1-op-1 begeleiding en ervaring met mensen met een mentale
              uitdaging.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {offerings.map((item, i) => {
            const c = palette[i % palette.length];
            return (
            <Reveal key={item.title} delay={i * 0.08}>
              <article
                className="group hover-lift relative h-full overflow-hidden rounded-lg"
                style={{ background: c.bg, color: c.fg }}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={`${item.title} — ${item.audience}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.bg}, ${c.bg}33 45%, transparent)` }} />
                  <span
                    className="absolute left-5 top-5 rounded-md px-3 py-1 text-xs backdrop-blur"
                    style={{ border: `1px solid ${c.fg}33`, background: `${c.bg}99`, color: c.fg }}
                  >
                    {item.audience}
                  </span>
                </div>
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-display text-lg font-black"
                      style={{ background: c.fg, color: c.bg }}
                    >
                      {item.label}
                    </span>
                    <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed" style={{ opacity: 0.85 }}>{item.description}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {item.bullets.map((b) => (
                      <li
                        key={b}
                        className="rounded-md px-3 py-1.5 text-xs"
                        style={{ border: `1px solid ${c.fg}40`, color: c.fg }}
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
