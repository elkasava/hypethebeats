"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const links = [
  { href: "/#aanbod", label: "Aanbod" },
  { href: "/studio", label: "Studio" },
  { href: "/#impact", label: "Impact" },
  { href: "/#over-ons", label: "Over ons" },
  { href: "/#faq", label: "Veelgesteld" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-6"
      }`}
    >
      <div className="container-px mx-auto flex max-w-7xl items-center justify-between">
        <div
          className={`flex w-full items-center justify-between rounded-xl px-5 py-2.5 transition-all duration-500 ${
            scrolled ? "glass shadow-2xl shadow-black/40" : ""
          }`}
        >
          <a href="/" aria-label="Hype The Beats — naar de homepagina" className="flex items-center gap-2.5">
            <span className="relative h-[2.56rem] w-[179px] sm:h-[3.2rem] sm:w-[218px]">
              <Image
                src="/logo.png"
                alt="Hype The Beats"
                fill
                priority
                unoptimized
                sizes="250px"
                className="object-contain object-left"
              />
            </span>
          </a>

          <nav aria-label="Hoofdmenu" className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/funzone"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:brightness-105"
            >
              Funzone
            </a>
            <a
              href="#contact"
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
            >
              Plan een gesprek
            </a>
          </div>

          <button
            aria-label={open ? "Menu sluiten" : "Menu openen"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border md:hidden"
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`h-px w-4 bg-foreground transition-transform ${
                  open ? "translate-y-[3px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-4 bg-foreground transition-transform ${
                  open ? "-translate-y-[3px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobiel menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="container-px mx-auto mt-3 max-w-7xl md:hidden"
          >
            <div className="glass flex flex-col gap-1 rounded-lg p-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-muted transition-colors hover:bg-black/5 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/funzone"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl bg-accent px-4 py-3 text-center text-sm font-medium text-foreground"
              >
                Funzone
              </a>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-xl bg-foreground px-4 py-3 text-center text-sm font-medium text-background"
              >
                Plan een gesprek
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
