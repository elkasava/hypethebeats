import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FunzoneStudio from "@/components/FunzoneStudio";

export const metadata: Metadata = {
  title: "Funzone — Hype The Beats",
  description:
    "Maak direct in je browser muziek: speel op de drumpads en piano in de Funzone van Hype The Beats.",
};

export default function FunzonePage() {
  return (
    <>
      <Header />
      <main className="pt-36 md:pt-44">
        <section className="container-px mx-auto max-w-5xl pb-28 md:pb-36">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
            Funzone
          </p>
          <h1 className="mt-4 font-display text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Maak meteen je eigen beat
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Welkom in de Funzone — een speeltuin met geluid. Tik op de drumpads, speel de
            piano en bouw je eigen ritme, direct in je browser. Zet je geluid aan! 🔊
          </p>

          <FunzoneStudio />
        </section>
      </main>
      <Footer />
    </>
  );
}
