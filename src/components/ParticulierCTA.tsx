"use client";

import { useEffect, useState } from "react";

// Creatieve, zwevende sticker-knop in de stijl van het clap-logo.
// Particulieren komen hiermee direct in het contactformulier terecht,
// waar het type automatisch op "Particulier" wordt gezet (#particulier).
export default function ParticulierCTA() {
  const [hidden, setHidden] = useState(false);

  // Verberg de knop zodra het contactformulier in beeld is — dan is hij overbodig.
  useEffect(() => {
    const target = document.getElementById("contact");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: "-20% 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href="#particulier"
      aria-label="Aanmelden als particulier"
      className={`group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-accent px-5 py-3.5 text-sm font-bold text-[#111110] shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-black/10 transition-all duration-300 hover:-translate-y-1 hover:rotate-2 hover:brightness-105 ${
        hidden ? "pointer-events-none translate-y-24 opacity-0" : "-rotate-3 opacity-100"
      }`}
    >
      <span className="text-lg leading-none transition-transform duration-300 group-hover:scale-125" aria-hidden="true">
        👏
      </span>
      <span className="hidden sm:inline">Ook als particulier? Meld je aan</span>
      <span className="sm:hidden">Particulier aanmelden</span>
    </a>
  );
}
