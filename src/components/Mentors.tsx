import Image from "next/image";
import { mentors } from "@/lib/content";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";

export default function Mentors() {
  return (
    <section id="mentoren" aria-label="Onze mentoren" className="relative z-10 -mt-[2vh] pb-28 md:-mt-[6vh] md:pb-36">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {mentors.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06}>
              <article className="group hover-lift flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_40px_rgba(99,91,255,0.14)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-bold tracking-tight">{m.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-accent-2">
                    {m.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{m.contribution}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-14">
          <AnimatedHeading
            text="De mensen die onze workshops bijzonder maken"
            highlight="bijzonder"
            className="font-display text-balance text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          />
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-4xl text-lg leading-relaxed text-muted">
              Naast ons vaste team werken we samen met gastmentoren uit de praktijk — elk met
              een eigen achtergrond, stijl en expertise die de deelnemers verder brengt.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
