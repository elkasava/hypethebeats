"use client";

import { useCallback, useEffect, useState } from "react";
import { playDrum, playNote, setKit, type DrumType, type Kit, type Wave } from "@/lib/funzoneAudio";
import Sequencer from "./Sequencer";
import LoopMixer from "./LoopMixer";

type Pad = { id: string; label: string; key: string; color: string; type: DrumType; icon: string };

const pads: Pad[] = [
  { id: "kick", label: "Kick", key: "z", color: "#84cc16", type: "kick", icon: "🦶" },
  { id: "snare", label: "Snare", key: "x", color: "#2563eb", type: "snare", icon: "🥁" },
  { id: "hihat", label: "Hi-hat", key: "c", color: "#ff5da2", type: "hihat", icon: "🔔" },
  { id: "clap", label: "Clap", key: "v", color: "#ff7a1a", type: "clap", icon: "👏" },
];

const keys = [
  { id: "c1", label: "C", note: "a", freq: 261.63 },
  { id: "d1", label: "D", note: "s", freq: 293.66 },
  { id: "e1", label: "E", note: "d", freq: 329.63 },
  { id: "f1", label: "F", note: "f", freq: 349.23 },
  { id: "g1", label: "G", note: "g", freq: 392.0 },
  { id: "a1", label: "A", note: "h", freq: 440.0 },
  { id: "b1", label: "B", note: "j", freq: 493.88 },
  { id: "c2", label: "C", note: "k", freq: 523.25 },
];

// Zwarte toetsen — afterIndex geeft aan na welke witte toets (0-based) hij hangt,
// net als op een echte piano (geen zwarte toets tussen E-F en B-C).
const blackKeys = [
  { id: "cs1", label: "C#", note: "w", freq: 277.18, afterIndex: 0 },
  { id: "ds1", label: "D#", note: "e", freq: 311.13, afterIndex: 1 },
  { id: "fs1", label: "F#", note: "t", freq: 369.99, afterIndex: 3 },
  { id: "gs1", label: "G#", note: "y", freq: 415.3, afterIndex: 4 },
  { id: "as1", label: "A#", note: "u", freq: 466.16, afterIndex: 5 },
];

const waves: { id: Wave; label: string }[] = [
  { id: "triangle", label: "Soft" },
  { id: "sine", label: "Pure" },
  { id: "sawtooth", label: "Sharp" },
  { id: "square", label: "Retro" },
];

const genres: { id: Kit; label: string }[] = [
  { id: "pop", label: "Pop" },
  { id: "dancehall", label: "Dancehall" },
  { id: "house", label: "House" },
  { id: "boombap", label: "Boom-bap" },
  { id: "reggae", label: "Reggae" },
  { id: "salsa", label: "Salsa" },
];

export default function FunzoneStudio() {
  const [active, setActive] = useState<Set<string>>(new Set());
  const [wave, setWave] = useState<Wave>("triangle");
  const [genre, setGenre] = useState<Kit>("pop");

  // Houd de drumkit in sync met de gekozen stijl
  useEffect(() => setKit(genre), [genre]);

  const flash = useCallback((id: string) => {
    setActive((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      setActive((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 130);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      const pad = pads.find((p) => p.key === k);
      const pianoKey = keys.find((n) => n.note === k) ?? blackKeys.find((n) => n.note === k);
      if (pad) {
        playDrum(pad.type);
        flash(pad.id);
      }
      if (pianoKey) {
        playNote(pianoKey.freq, wave);
        flash(pianoKey.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flash, wave]);

  return (
    <div className="mt-12 space-y-12">
      {/* Stijl-kiezer */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">Stijl</span>
        <div className="flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1">
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setGenre(g.id)}
              aria-pressed={genre === g.id}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                genre === g.id ? "bg-accent text-[#111110]" : "text-muted hover:text-foreground"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Beatmaker */}
      <Sequencer genre={genre} />

      {/* Drumpads */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Drumpads</h2>
        <p className="mt-1 text-sm text-muted">
          Tik op een pad of gebruik je toetsenbord:{" "}
          <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">Z</kbd>{" "}
          <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">X</kbd>{" "}
          <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">C</kbd>{" "}
          <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">V</kbd>
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {pads.map((pad) => {
            const on = active.has(pad.id);
            return (
              <button
                key={pad.id}
                onPointerDown={() => {
                  playDrum(pad.type);
                  flash(pad.id);
                }}
                aria-label={pad.label}
                className="flex aspect-square select-none flex-col items-center justify-center rounded-2xl text-[#111110] transition-transform duration-100"
                style={{
                  background: pad.color,
                  transform: on ? "scale(0.94)" : "scale(1)",
                  boxShadow: on
                    ? `0 0 0 4px ${pad.color}55, 0 0 40px ${pad.color}99`
                    : "0 8px 24px rgba(0,0,0,0.15)",
                }}
              >
                <span aria-hidden className="text-3xl">
                  {pad.icon}
                </span>
                <span className="mt-1 font-display text-2xl font-black">{pad.label}</span>
                <span className="mt-1 text-xs font-bold uppercase tracking-widest opacity-70">
                  {pad.key}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synth */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Synth</h2>
            <p className="mt-1 text-sm text-muted">
              Speel met je muis of de rij{" "}
              <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">A</kbd> …{" "}
              <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">K</kbd>
            </p>
          </div>
          <div className="flex gap-1.5 rounded-xl border border-border bg-surface p-1.5">
            {waves.map((w) => (
              <button
                key={w.id}
                onClick={() => setWave(w.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  wave === w.id ? "bg-accent text-[#111110]" : "text-muted hover:text-foreground"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-1.5 overflow-x-auto pb-2">
          {keys.map((n, i) => {
            const on = active.has(n.id);
            const blackKey = blackKeys.find((bk) => bk.afterIndex === i);
            const blackOn = blackKey ? active.has(blackKey.id) : false;
            return (
              <div key={n.id} className="relative min-w-[3rem] flex-1">
                <button
                  onPointerDown={() => {
                    playNote(n.freq, wave);
                    flash(n.id);
                  }}
                  aria-label={`Noot ${n.label}`}
                  className="flex h-44 w-full select-none flex-col items-center justify-end rounded-b-xl border border-border pb-4 transition-all duration-100"
                  style={{
                    background: on ? "var(--accent)" : "var(--surface)",
                    transform: on ? "translateY(3px)" : "translateY(0)",
                  }}
                >
                  <span className="font-display text-lg font-bold text-foreground">{n.label}</span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                    {n.note}
                  </span>
                </button>

                {blackKey && (
                  <button
                    onPointerDown={() => {
                      playNote(blackKey.freq, wave);
                      flash(blackKey.id);
                    }}
                    aria-label={`Noot ${blackKey.label}`}
                    className="absolute right-0 top-0 z-10 flex h-28 w-7 -translate-x-1/2 select-none flex-col items-center justify-end rounded-b-md pb-2 shadow-lg transition-all duration-100 sm:w-8"
                    style={{
                      background: blackOn ? "var(--accent)" : "#111110",
                      transform: blackOn ? "translateX(-50%) translateY(2px)" : "translateX(-50%)",
                    }}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">
                      {blackKey.note}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loop-mixer */}
      <LoopMixer />
    </div>
  );
}
