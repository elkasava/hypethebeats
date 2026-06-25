"use client";

import { FormEvent, useEffect, useState } from "react";
import Reveal from "./Reveal";

const organizations = [
  "Particulier",
  "Gemeente",
  "School",
  "Zorginstelling",
  "Jongerenorganisatie",
  "Anders",
];

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [orgType, setOrgType] = useState("");

  // Wanneer iemand via de particulier-knop komt (#particulier), selecteren we
  // automatisch "Particulier" en scrollen we naar het formulier.
  useEffect(() => {
    const apply = () => {
      if (window.location.hash === "#particulier") {
        setOrgType("Particulier");
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    window.setTimeout(() => setStatus("success"), 900);
  };

  return (
    <section id="contact" aria-label="Contact" className="bg-surface py-28 md:py-36">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left: copy */}
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-2">
                Contact
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-4 font-display text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Laten we samen iets moois bouwen
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                Vertel ons over uw organisatie en doelgroep. Binnen twee werkdagen nemen we
                contact op voor een vrijblijvend kennismakingsgesprek.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <address className="mt-10 space-y-4 not-italic">
                {[
                  { icon: "✉", text: "hallo@hypethebeats.nl", href: "mailto:hallo@hypethebeats.nl" },
                  { icon: "☎", text: "06 40 04 05 07", href: "tel:+31640040507" },
                  { icon: "⌖", text: "Markengouw 53, Amsterdam", href: null },
                ].map((item) => {
                  const inner = (
                    <>
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted"
                      >
                        {item.icon}
                      </span>
                      <span className="text-muted">{item.text}</span>
                    </>
                  );
                  const cls =
                    "flex items-center gap-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm transition-colors hover:border-accent/50";
                  return item.href ? (
                    <a key={item.text} href={item.href} className={cls}>
                      {inner}
                    </a>
                  ) : (
                    <div key={item.text} className={cls}>
                      {inner}
                    </div>
                  );
                })}
              </address>
            </Reveal>

            {/* Trust signals */}
            <Reveal delay={0.32}>
              <div className="mt-10 flex flex-wrap gap-3">
                {["Vrijblijvend gesprek", "Binnen 2 werkdagen reactie", "Geen verborgen kosten"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-xs text-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {tag}
                    </span>
                  )
                )}
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal delay={0.12}>
            <div className="rounded-lg border border-border bg-surface-2 p-8 sm:p-10">
              {status === "success" ? (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl text-foreground">
                    ✓
                  </span>
                  <h3 className="mt-6 font-display text-3xl font-black tracking-tight">
                    Bericht verzonden!
                  </h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                    Bedankt voor uw aanvraag. We nemen binnen twee werkdagen contact met u op.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Naam" name="name" type="text" required placeholder="Uw volledige naam" />
                    <Field label="E-mailadres" name="email" type="email" required placeholder="naam@organisatie.nl" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-muted" htmlFor="organization-type">
                      Ik meld me aan als
                    </label>
                    <select
                      id="organization-type"
                      name="organizationType"
                      required
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
                    >
                      <option value="" disabled>
                        Maak een keuze
                      </option>
                      {organizations.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Field
                    label="Organisatie (indien van toepassing)"
                    name="organization"
                    type="text"
                    placeholder="Naam van uw organisatie — particulieren mogen dit leeg laten"
                  />

                  <div>
                    <label className="mb-2 block text-sm text-muted" htmlFor="message">
                      Vertel ons over uw vraag
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Doelgroep, gewenste planning, aantal deelnemers..."
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-7 py-4 text-sm font-bold text-foreground transition-all hover:brightness-105 disabled:opacity-60"
                  >
                    {status === "submitting" ? "Versturen..." : "Verstuur aanvraag"}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                  <p className="text-center text-xs text-muted">
                    Door te versturen gaat u akkoord met onze privacyverklaring.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-muted" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
      />
    </div>
  );
}
