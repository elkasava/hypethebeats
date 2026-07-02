import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import AnimatedHeading from "@/components/AnimatedHeading";

export const metadata: Metadata = {
  title: "Studio — Hype The Beats",
  description:
    "De Studio van Hype The Beats: ruim, sfeervol en akoestisch ingericht voor studiosessies met meerdere mensen.",
};

const EQUIPMENT = [
  {
    category: "Speakers",
    items: [
      "2x KRK VXT",
      "2x Adam Audio A7V",
      "2x Yamaha HS5",
      "2x Yamaha HS8",
      "1x KRK S8 actieve studio subwoofer",
      "1x Adam Audio Sub",
    ],
  },
  {
    category: "Microfoons",
    items: ["Neumann TLM 103", "Telefunken TF51"],
  },
  {
    category: "Koptelefoons",
    items: ["2x Sennheiser HD50x"],
  },
  {
    category: "Geluidskaarten",
    items: ["Focusrite Scarlett 2i2", "Apollo Twin X"],
  },
  {
    category: "Synths",
    items: ["AMS Hydrasynth", "Korg Triton", "Prophet 5"],
  },
];

const PRICING = [
  { label: "Per uur", price: "€74,99" },
  { label: "25 uur", price: "€1.499" },
  { label: "50 uur", price: "€2.999" },
  { label: "100 uur", price: "€5.999" },
];

export default function StudioPage() {
  return (
    <>
      <Header />
      <main className="pt-36 md:pt-44">
        <section className="container-px mx-auto max-w-5xl pb-16 md:pb-20">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
              Studio
            </p>
          </Reveal>
          <AnimatedHeading
            text="De Studio"
            highlight="Studio"
            className="mt-4 font-display text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
          />
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Deze studio is groter en comfortabeler. Deze luxueuze sfeerstudio is perfect
              als je een studiosessie hebt met meerdere mensen. In deze ruime, sfeervolle en
              akoestisch goede studio ben jij voorzien van alles.
            </p>
          </Reveal>
        </section>

        <section className="container-px mx-auto max-w-5xl pb-16 md:pb-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Deze studio beschikt over
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {EQUIPMENT.map((group, i) => (
              <Reveal key={group.category} delay={0.08 + i * 0.06}>
                <div className="rounded-lg border border-border bg-surface-2 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">
                    {group.category}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm text-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="container-px mx-auto max-w-5xl pb-28 md:pb-36">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Tarieven
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-4">
              {PRICING.map((p) => (
                <div key={p.label} className="bg-surface-2 px-6 py-8 text-center">
                  <p className="text-sm text-muted">{p.label}</p>
                  <p className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                    {p.price}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-sm text-muted">Prijzen zijn inclusief BTW.</p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8">
              <a
                href="/#contact"
                className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
              >
                Plan een sessie
              </a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
