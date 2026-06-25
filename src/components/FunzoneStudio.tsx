"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Speelbare mini-studio: drumpads + piano, volledig gesynthetiseerd via de
// Web Audio API. Geen audiobestanden nodig — alles wordt live opgewekt.

type Pad = { id: string; label: string; key: string; color: string; type: "kick" | "snare" | "hihat" | "clap" };

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

export default function FunzoneStudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const [active, setActive] = useState<Set<string>>(new Set());

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      // Witte-ruis buffer (1 sec) voor snare/hihat/clap
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noiseRef.current = buffer;
      ctxRef.current = ctx;
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

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

  const playNote = useCallback(
    (freq: number) => {
      const ctx = getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.95);
    },
    [getCtx]
  );

  const playDrum = useCallback(
    (type: Pad["type"]) => {
      const ctx = getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === "kick") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
        return;
      }

      const src = ctx.createBufferSource();
      src.buffer = noiseRef.current;
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      if (type === "hihat") {
        filter.type = "highpass";
        filter.frequency.value = 7000;
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else if (type === "snare") {
        filter.type = "highpass";
        filter.frequency.value = 1500;
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        const tone = ctx.createOscillator();
        const tg = ctx.createGain();
        tone.type = "triangle";
        tone.frequency.value = 180;
        tg.gain.setValueAtTime(0.4, now);
        tg.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        tone.connect(tg).connect(ctx.destination);
        tone.start(now);
        tone.stop(now + 0.16);
      } else {
        // clap
        filter.type = "bandpass";
        filter.frequency.value = 1200;
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      }

      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.3);
    },
    [getCtx]
  );

  // Toetsenbordbediening
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      const pad = pads.find((p) => p.key === k);
      const pianoKey = keys.find((n) => n.note === k);
      if (pad) {
        playDrum(pad.type);
        flash(pad.id);
      }
      if (pianoKey) {
        playNote(pianoKey.freq);
        flash(pianoKey.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playDrum, playNote, flash]);

  return (
    <div className="mt-14">
      {/* Drumpads */}
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

      {/* Piano */}
      <h2 className="mt-14 font-display text-2xl font-bold tracking-tight">Piano</h2>
      <p className="mt-1 text-sm text-muted">
        Speel de toetsen met je muis of de rij{" "}
        <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">A</kbd> …{" "}
        <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">K</kbd>
      </p>
      <div className="mt-5 flex gap-1.5 overflow-x-auto pb-2">
        {keys.map((n) => {
          const on = active.has(n.id);
          return (
            <button
              key={n.id}
              onPointerDown={() => {
                playNote(n.freq);
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
  );
}
