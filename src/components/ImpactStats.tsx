import { stats } from "@/lib/content";
import Reveal from "./Reveal";
import AnimatedCounter from "./AnimatedCounter";
import AnimatedHeading from "./AnimatedHeading";
import Sticker from "./Sticker";

export default function ImpactStats() {
  return (
    <section id="impact" aria-label="Impact in cijfers" className="relative bg-surface-2 py-24 md:py-32">
      <Sticker shape="circle" color="#84cc16" rotate={10} size={1.25} className="absolute right-4 top-14 z-20 hidden lg:block">
        Beats
      </Sticker>
      <div className="container-px mx-auto max-w-7xl">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
            Impact in cijfers
          </p>
        </Reveal>
        <AnimatedHeading
          text="Resultaten waar opdrachtgevers op kunnen bouwen"
          className="mt-4 font-display text-balance text-5xl font-black leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        />

        <div className="mt-16 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="bg-surface-2 px-8 py-10">
                <p className="font-display text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted">
            Onze trajecten worden continu geëvalueerd. We meten niet alleen bereik, maar ook
            effect: op welbevinden, ontwikkeling en verbinding binnen de gemeenschap.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
