import { programs } from "@/lib/content";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";

// Spotify Wrapped-stijl: harde, volvlakse kleurblokken
const palette = [
  { bg: "#84cc16", fg: "#111110" }, // lime
  { bg: "#2563eb", fg: "#ffffff" }, // blauw
  { bg: "#ff5da2", fg: "#111110" }, // roze
  { bg: "#7c3aed", fg: "#ffffff" }, // paars
  { bg: "#ff7a1a", fg: "#111110" }, // oranje
  { bg: "#111110", fg: "#ffffff" }, // zwart — sluit aan op de donkere balk
];

export default function Programs() {
  return (
    <section id="trajecten" aria-label="Trajecten" className="py-28 md:py-36">
      <div className="container-px mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
              Trajecten
            </p>
          </Reveal>
          <AnimatedHeading
            text="Gerichte begeleiding voor ieder doel"
            className="mt-4 font-display text-balance text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((item, i) => {
            const c = palette[i % palette.length];
            return (
              <Reveal key={item.title} delay={i * 0.06}>
                <article
                  className="hover-lift flex h-full flex-col rounded-lg p-8"
                  style={{ background: c.bg, color: c.fg }}
                >
                  <span className="font-display text-6xl font-black leading-none" style={{ opacity: 0.85 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ opacity: 0.85 }}>
                    {item.description}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-md px-3 py-1.5 text-xs"
                        style={{ border: `1px solid ${c.fg}40`, color: c.fg }}
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
