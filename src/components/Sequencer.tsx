"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCtx,
  playDrum,
  setMasterVolume,
  setMuted,
  type DrumType,
  type Kit,
} from "@/lib/funzoneAudio";

type Track = { id: string; label: string; color: string; type: DrumType };

const tracks: Track[] = [
  { id: "kick", label: "Kick", color: "#84cc16", type: "kick" },
  { id: "snare", label: "Snare", color: "#2563eb", type: "snare" },
  { id: "hihat", label: "Hi-hat", color: "#ff5da2", type: "hihat" },
  { id: "clap", label: "Clap", color: "#ff7a1a", type: "clap" },
];

const STEPS = 16;
type Grid = boolean[][];

const empty = (): Grid => tracks.map(() => Array(STEPS).fill(false));

const b = (s: string): boolean[] => s.split("").map((c) => c === "1");

// Genre-typische startpatronen
const genrePatterns: Record<Kit, Grid> = {
  pop: [
    b("1000100010001000"), // kick — four on the floor
    b("0000100000001000"), // snare — backbeat
    b("0010001000100010"), // hihat — offbeat
    b("0000000000000000"), // clap
  ],
  dancehall: [
    b("1000001010000010"), // kick — syncopated boom
    b("0000000010000000"), // snare — on the 3
    b("1010101010101010"), // hihat — driving 8ths
    b("0000100000001000"), // clap — backbeat
  ],
  house: [
    b("1000100010001000"), // kick — four on the floor
    b("0000000000000000"), // snare
    b("0010001000100010"), // hihat — offbeat
    b("0000100000001000"), // clap — backbeat
  ],
  boombap: [
    b("1000000000100000"), // kick — laid back
    b("0000100000001000"), // snare — backbeat
    b("1010101010101010"), // hihat — 8ths (zet swing erbij!)
    b("0000000000000000"), // clap
  ],
};

const tempoFor: Record<Kit, number> = { pop: 116, dancehall: 100, house: 124, boombap: 90 };

export default function Sequencer({ genre }: { genre: Kit }) {
  const [bpm, setBpm] = useState(tempoFor[genre]);
  const [swing, setSwing] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [mute, setMute] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [grid, setGrid] = useState<Grid>(() => genrePatterns[genre].map((r) => r.slice()));
  const [currentStep, setCurrentStep] = useState(-1);

  const gridRef = useRef(grid);
  const bpmRef = useRef(bpm);
  const swingRef = useRef(swing);
  const nextNoteTimeRef = useRef(0);
  const stepRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const queueRef = useRef<{ step: number; time: number }[]>([]);
  const shownRef = useRef(-1);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    swingRef.current = swing;
  }, [swing]);
  useEffect(() => setMasterVolume(volume), [volume]);
  useEffect(() => setMuted(mute), [mute]);

  // Bij stijlwissel: laad het genre-patroon en het bijpassende tempo
  useEffect(() => {
    setGrid(genrePatterns[genre].map((r) => r.slice()));
    setBpm(tempoFor[genre]);
  }, [genre]);

  const schedule = useCallback(() => {
    const c = getCtx();
    if (!c) return;
    const scheduleAhead = 0.1;
    while (nextNoteTimeRef.current < c.currentTime + scheduleAhead) {
      const step = stepRef.current;
      const time = nextNoteTimeRef.current;
      const secondsPer16th = (60 / bpmRef.current) * 0.25;
      // Swing: vertraag de "en"-tellen (off-8ths: stap 2,6,10,14) voor een shuffle-gevoel
      const swung = step % 4 === 2;
      const playTime = time + (swung ? swingRef.current * secondsPer16th * 2 : 0);
      const g = gridRef.current;
      tracks.forEach((t, i) => {
        if (g[i][step]) playDrum(t.type, playTime);
      });
      queueRef.current.push({ step, time: playTime });
      nextNoteTimeRef.current += secondsPer16th;
      stepRef.current = (step + 1) % STEPS;
    }
    timerRef.current = window.setTimeout(schedule, 25);
  }, []);

  const draw = useCallback(() => {
    const c = getCtx();
    if (c) {
      const now = c.currentTime;
      const q = queueRef.current;
      while (q.length && q[0].time <= now) {
        shownRef.current = q[0].step;
        q.shift();
      }
      setCurrentStep(shownRef.current);
    }
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    timerRef.current = null;
    rafRef.current = null;
    queueRef.current = [];
    shownRef.current = -1;
    setCurrentStep(-1);
  }, []);

  const start = useCallback(() => {
    const c = getCtx();
    if (!c) return;
    setPlaying(true);
    stepRef.current = 0;
    nextNoteTimeRef.current = c.currentTime + 0.06;
    queueRef.current = [];
    schedule();
    rafRef.current = requestAnimationFrame(draw);
  }, [schedule, draw]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const toggle = (track: number, step: number) => {
    setGrid((prev) => {
      const next = prev.map((r) => r.slice());
      next[track][step] = !next[track][step];
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-foreground/10 bg-[#111110] p-5 text-white sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h2 className="font-display text-2xl font-bold tracking-tight">Beatmaker</h2>
          </div>
          <p className="mt-1 text-sm text-white/55">
            16-stappen loop · klik de vakjes en druk op play
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => (playing ? stop() : start())}
            aria-label={playing ? "Stop" : "Play"}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-[#111110] transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? "■" : "▶"}
          </button>
          <button
            onClick={() => setGrid(empty())}
            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            Wissen
          </button>
        </div>
      </div>

      {/* Regelaars: BPM · Swing · Volume · Mute */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-white/45">BPM</span>
          <input
            type="range"
            min={70}
            max={170}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="h-1.5 w-36 cursor-pointer appearance-none rounded-full bg-white/15 accent-accent"
          />
          <span className="w-9 font-display text-base font-black tabular-nums">{bpm}</span>
        </label>

        <label className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-white/45">Swing</span>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={swing}
            onChange={(e) => setSwing(Number(e.target.value))}
            className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-white/15 accent-accent"
          />
          <span className="w-9 font-display text-base font-black tabular-nums">
            {Math.round(swing * 200)}
          </span>
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMute((m) => !m)}
            aria-label={mute ? "Geluid aan" : "Dempen"}
            aria-pressed={mute}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-base transition-colors ${
              mute
                ? "border-transparent bg-white text-[#111110]"
                : "border-white/15 text-white hover:bg-white/10"
            }`}
          >
            {mute ? "🔇" : "🔊"}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={mute ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (mute) setMute(false);
            }}
            aria-label="Volume"
            className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-white/15 accent-accent"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 space-y-1.5">
        {tracks.map((t, ti) => (
          <div key={t.id} className="flex items-center gap-2 sm:gap-3">
            <span
              className="w-12 shrink-0 text-[10px] font-bold uppercase tracking-widest sm:w-16 sm:text-xs"
              style={{ color: t.color }}
            >
              {t.label}
            </span>
            <div
              className="grid flex-1 gap-1 sm:gap-1.5"
              style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
            >
              {Array.from({ length: STEPS }).map((_, si) => {
                const on = grid[ti][si];
                const isBeat = si % 4 === 0;
                const playhead = playing && currentStep === si;
                return (
                  <button
                    key={si}
                    onClick={() => toggle(ti, si)}
                    aria-label={`${t.label} stap ${si + 1}`}
                    aria-pressed={on}
                    className="aspect-square w-full rounded-[5px] transition-colors duration-75 sm:rounded-md"
                    style={{
                      background: on ? t.color : isBeat ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
                      boxShadow: playhead
                        ? "inset 0 0 0 2px #ffffff"
                        : on
                        ? `0 0 12px ${t.color}aa`
                        : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
