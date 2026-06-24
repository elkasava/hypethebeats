import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Funzone — Hype The Beats",
  description: "Speel met 3D interactieve instrumenten in de Funzone.",
};

const instruments = [
  { name: "Drums", emoji: "🥁", hint: "Tik en hoor het ritme" },
  { name: "Piano", emoji: "🎹", hint: "Speel de toetsen" },
  { name: "Gitaar", emoji: "🎸", hint: "Tokkel de snaren" },
  { name: "Conga's", emoji: "🪘", hint: "Roffel mee" },
];

export default function FunzonePage() {
  return (
    <>
      <Header />
      <main className="pt-36 md:pt-44">
        <section className="container-px mx-auto max-w-7xl pb-28 md:pb-36">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
            Funzone
          </p>
          <h1 className="mt-4 font-display text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Speel met 3D interactieve instrumenten
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Hier komen straks de interactieve 3D-instrumenten. Klik, sleep en maak je eigen
            geluid — direct in je browser.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {instruments.map((inst) => (
              <article
                key={inst.name}
                className="group flex aspect-square flex-col items-center justify-center rounded-lg border border-border bg-surface text-center transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_40px_rgba(99,91,255,0.16)]"
              >
                <span className="text-6xl transition-transform duration-300 group-hover:scale-110">
                  {inst.emoji}
                </span>
                <h2 className="mt-5 font-display text-xl font-bold tracking-tight">
                  {inst.name}
                </h2>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted">{inst.hint}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
            <p className="text-sm text-muted">
              💡 Plek gereserveerd voor de 3D-instrumenten (bijv. met Three.js / React Three
              Fiber). Laat het me weten welk instrument je eerst wilt bouwen.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
