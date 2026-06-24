import Image from "next/image";
import { partners } from "@/lib/content";
import Reveal from "./Reveal";

export default function Partners() {
  const loop = [...partners, ...partners];

  return (
    <section>
      <div className="container-px mx-auto max-w-7xl">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-foreground/55">
            Vertrouwd door organisaties door heel Nederland
          </p>
        </Reveal>
      </div>

      <div className="relative mt-6 overflow-hidden bg-[#262626] py-5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#262626] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#262626] to-transparent" />
        <div className="flex w-max animate-marquee items-center gap-16">
          {loop.map((partner, i) => (
            <a
              key={`${partner.name}-${i}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={partner.name}
              className="group relative h-16 w-64 shrink-0 opacity-70 transition-all duration-300 hover:opacity-100 sm:h-20 sm:w-80"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                sizes="400px"
                className="object-contain transition-transform duration-300 group-hover:scale-125"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
