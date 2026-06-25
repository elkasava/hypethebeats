import Image from "next/image";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";

const values = [
  {
    title: "Vakmanschap",
    description:
      "10 jaar ervaring, doorgegeven door succesvolle muzikanten met meerdere gouden en platina certificeringen op hun naam.",
  },
  {
    title: "Maatwerk",
    description:
      "Geen vaste programma's van de plank. Elk traject wordt samen met de opdrachtgever ontworpen rond concrete doelen en context.",
  },
  {
    title: "Meetbare impact",
    description:
      "We werken met heldere doelstellingen en evaluatiemomenten, zodat resultaten zichtbaar en verantwoordbaar zijn.",
  },
];

export default function About() {
  return (
    <section id="over-ons" aria-label="Over ons" className="py-28 md:py-36">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border">
                <Image
                  src="/offerings/studio.webp"
                  alt="De professionele studio van Hype The Beats waar workshops en opnames plaatsvinden"
                  fill
                  sizes="(max-width: 1024px) 90vw, 44vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -right-4 bottom-12 rounded-lg border border-border bg-surface px-6 py-4 shadow-xl sm:-right-8">
                <p className="text-xs uppercase tracking-widest text-muted">Opgericht in</p>
                <p className="mt-1 font-display text-4xl font-black text-foreground">2014</p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
                Over ons
              </p>
            </Reveal>
            <AnimatedHeading
              text="Een team dat gelooft in de kracht van samen muziek maken"
              className="mt-4 font-display text-balance text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            />
            <Reveal delay={0.16}>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                Hype The Beats werd in 2014 opgericht vanuit de overtuiging dat muziek mensen
                samenbrengt — over generaties, achtergronden en beperkingen heen. Inmiddels werken
                we structureel samen met tientallen gemeenten, scholen en zorginstellingen door
                heel Nederland, met een vast team van twintig gecertificeerde muziekdocenten en
                -therapeuten.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={0.24 + i * 0.08}>
                  <div className="group rounded-lg border border-border bg-surface p-5 transition-all hover:border-accent/40 hover:shadow-[0_0_30px_rgba(99,91,255,0.14)]">
                    <div className="mb-3 h-1 w-8 rounded-full bg-accent" />
                    <h3 className="font-display text-lg font-bold tracking-tight">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{v.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
