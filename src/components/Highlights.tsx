import Reveal from "./Reveal";

export default function Highlights() {
  return (
    <section className="py-28 md:py-36">
      <div className="container-px mx-auto max-w-5xl text-center">
        <Reveal>
          <p className="font-display text-3xl font-black leading-[1.5] tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.5]">
            Bij Hype The Beats leren deelnemers{" "}
            <span className="word-pill">beats maken</span>,{" "}
            <span className="word-pill">songs schrijven</span> en{" "}
            <span className="word-pill">opnemen</span> — bouwen aan{" "}
            <span className="word-pill">zelfvertrouwen</span> en zetten een{" "}
            <span className="word-pill">eigen track</span> op het podium.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
