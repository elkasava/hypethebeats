import Image from "next/image";
import { testimonials } from "@/lib/content";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Testimonials() {
  const [first, ...rest] = testimonials;

  return (
    <section id="verhalen" aria-label="Verhalen van opdrachtgevers" className="relative bg-surface-2 py-28 md:py-36">
      <div className="container-px relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
                Verhalen
              </p>
            </Reveal>
            <AnimatedHeading
              text="Wat opdrachtgevers over ons zeggen"
              className="mt-4 font-display text-balance text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            />
          </div>
          <Reveal delay={0.16}>
            <p className="max-w-xs text-sm text-muted lg:text-right">
              Wij werken voor gemeenten, scholen en zorginstellingen door heel Nederland.
            </p>
          </Reveal>
        </div>

        {/* Featured quote */}
        {first && (
          <Reveal delay={0.12}>
            <figure className="mt-14 overflow-hidden rounded-lg border border-border bg-surface p-10 sm:p-14 lg:p-16">
              <blockquote>
                <p className="font-display text-balance text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  &ldquo;{first.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-sm font-bold text-foreground">
                  {initials(first.name)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{first.name}</p>
                  <p className="text-sm text-muted">{first.role}</p>
                </div>
                {first.logo && (
                  <div className="relative ml-auto h-12 w-28 shrink-0 opacity-80">
                    <Image src={first.logo} alt={first.role} fill sizes="112px" className="object-contain object-right" />
                  </div>
                )}
              </figcaption>
            </figure>
          </Reveal>
        )}

        {/* Remaining testimonials */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {rest.map((t, i) => (
            <Reveal key={t.name} delay={0.2 + i * 0.08}>
              <figure className="flex h-full flex-col justify-between rounded-lg border border-border bg-surface p-8">
                <blockquote>
                  <p className="font-display text-balance text-xl leading-relaxed tracking-tight text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-xs font-bold text-foreground">
                    {initials(t.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                  {t.logo && (
                    <div className="relative ml-auto h-9 w-24 shrink-0 opacity-80">
                      <Image src={t.logo} alt={t.role} fill sizes="96px" className="object-contain object-right" />
                    </div>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
