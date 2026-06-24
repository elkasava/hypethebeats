import Image from "next/image";

const columns = [
  {
    title: "Aanbod",
    links: [
      { label: "Schoolworkshops", href: "#aanbod" },
      { label: "Zorg & welzijn", href: "#aanbod" },
      { label: "Jongerenprojecten", href: "#aanbod" },
      { label: "Events", href: "#aanbod" },
    ],
  },
  {
    title: "Organisatie",
    links: [
      { label: "Over ons", href: "#over-ons" },
      { label: "Impact", href: "#impact" },
      { label: "Verhalen", href: "#verhalen" },
      { label: "Vacatures", href: "#" },
    ],
  },
  {
    title: "Informatie",
    links: [
      { label: "Veelgestelde vragen", href: "#faq" },
      { label: "Privacyverklaring", href: "#" },
      { label: "Algemene voorwaarden", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-16">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="rounded-2xl bg-[#e9e9e1] p-7">
            <a href="#top" className="inline-flex items-center gap-2.5">
              <span className="relative h-10 w-[180px]">
                <Image
                  src="/logo.png"
                  alt="Hype The Beats"
                  fill
                  unoptimized
                  sizes="180px"
                  className="object-contain object-left"
                />
              </span>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Muziekworkshops met meetbare impact voor gemeenten, scholen, zorginstellingen en
              jongerenorganisaties — door heel Nederland.
            </p>

            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-foreground transition-all hover:brightness-105"
            >
              Vraag een offerte aan →
            </a>
          </div>

          {/* Links */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="rounded-2xl bg-[#e9e9e1] p-7">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Hype The Beats. Alle rechten voorbehouden.</p>
          <p>KVK 66253284 · Utrecht, Nederland</p>
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Hype The Beats is onderdeel van Vunga Film
        </p>
      </div>
    </footer>
  );
}
