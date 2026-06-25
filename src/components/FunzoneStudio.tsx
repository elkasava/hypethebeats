"use client";

import { useCallback, useEffect, useState } from "react";
import { playDrum, playNote, type DrumType, type Wave } from "@/lib/funzoneAudio";
import Sequencer from "./Sequencer";

type Pad = { id: string; label: string; key: string; color: string; type: DrumType };

const pads: Pad[] = [
  { id: "kick", label: "Kick", key: "z", color: "#84cc16", type: "kick" },
  { id: "snare", label: "Snare", key: "x", color: "#2563eb", type: "snare" },
  { id: "hihat", label: "Hi-hat", key: "c", color: "#ff5da2", type: "hihat" },
  { id: "clap", label: "Clap", key: "v", color: "#ff7a1a", type: "clap" },
];

// Eén octaaf, gekoppeld aan de toetsen a s d f g h j k
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

const waves: { id: Wave; label: string }[] = [
  { id: "triangle", label: "Soft" },
  { id: "sine", label: "Pure" },
  { id: "sawtooth", label: "Sharp" },
  { id: "square", label: "Retro" },
];

export default function FunzoneStudio() {
  const [active, setActive] = useState<Set<string>>(new Set());
  const [wave, setWave] = useState<Wave>("triangle");

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

  // Toetsenbordbediening voor pads + piano
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      const pad = pads.find((p) => p.key === k);
      const pianoKey = keys.find((n) => n.note === k);
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
    <div className="mt-14 space-y-16">
      {/* Sequencer / mini-DAW */}
      <Sequencer />

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
                <span className="font-display text-3xl font-black">{pad.label}</span>
                <span className="mt-1 text-xs font-bold uppercase tracking-widest opacity-70">
                  {pad.key}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synth / piano */}
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
          {/* Golfvorm-kiezer */}
          <div className="flex gap-1.5 rounded-xl border border-border bg-surface p-1.5">
            {waves.map((w) => (
              <button
                key={w.id}
                onClick={() => setWave(w.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  wave === w.id
                    ? "bg-accent text-[#111110]"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-1.5 overflow-x-auto pb-2">
          {keys.map((n) => {
            const on = active.has(n.id);
            return (
              <button
                key={n.id}
                onPointerDown={() => {
                  playNote(n.freq, wave);
                  flash(n.id);
                }}
                aria-label={`Noot ${n.label}`}
                className="flex h-44 min-w-[3rem] flex-1 select-none flex-col items-center justify-end rounded-b-xl border border-border pb-4 transition-all duration-100"
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
