"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCtx, playDrum, type DrumType } from "@/lib/funzoneAudio";

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

// Een paar starters zodat het meteen groovet
const presets: Record<string, Grid> = {
  House: [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    Array(STEPS).fill(false),
  ],
  "Boom-bap": [
    [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    Array(STEPS).fill(false),
  ],
};

export default function Sequencer() {
  const [bpm, setBpm] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [grid, setGrid] = useState<Grid>(() =>
    presets.House.map((r) => r.slice())
  );
  const [currentStep, setCurrentStep] = useState(-1);

  // Refs zodat de scheduler altijd de laatste waarden leest
  const gridRef = useRef(grid);
  const bpmRef = useRef(bpm);
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

  const schedule = useCallback(() => {
    const c = getCtx();
    if (!c) return;
    const scheduleAhead = 0.1;
    while (nextNoteTimeRef.current < c.currentTime + scheduleAhead) {
      const step = stepRef.current;
      const time = nextNoteTimeRef.current;
      const g = gridRef.current;
      tracks.forEach((t, i) => {
        if (g[i][step]) playDrum(t.type, time);
      });
      queueRef.current.push({ step, time });
      const secondsPerBeat = 60 / bpmRef.current;
      nextNoteTimeRef.current += 0.25 * secondsPerBeat; // 16e noot
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

  // Opruimen bij unmount
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
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Beatmaker</h2>
          <p className="mt-1 text-sm text-muted">
            Klik de vakjes aan en druk op play — je 16-stappen loop speelt af.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => (playing ? stop() : start())}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-[#111110] transition-all hover:brightness-105"
          >
            {playing ? "■ Stop" : "▶ Play"}
          </button>
          <button
            onClick={() => setGrid(empty())}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-black/5"
          >
            Wissen
          </button>
        </div>
      </div>

      {/* BPM + presets */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-3 text-sm">
          <span className="font-bold uppercase tracking-widest text-muted">BPM</span>
          <input
            type="range"
            min={60}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="h-1.5 w-40 cursor-pointer appearance-none rounded-full bg-surface-2 accent-accent"
          />
          <span className="w-10 font-display text-lg font-black tabular-nums">{bpm}</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">Preset</span>
          {Object.keys(presets).map((name) => (
            <button
              key={name}
              onClick={() => setGrid(presets[name].map((r) => r.slice()))}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/5"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 space-y-2 overflow-x-auto">
        {tracks.map((t, ti) => (
          <div key={t.id} className="flex items-center gap-3">
            <span
              className="w-16 shrink-0 text-xs font-bold uppercase tracking-widest"
              style={{ color: t.color }}
            >
              {t.label}
            </span>
            <div className="flex gap-1.5">
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
                    className={`h-9 w-9 shrink-0 rounded-md transition-all duration-75 ${
                      isBeat ? "ring-1 ring-border" : ""
                    } ${playhead ? "scale-110" : ""}`}
                    style={{
                      background: on ? t.color : isBeat ? "var(--surface-2)" : "rgba(0,0,0,0.05)",
                      boxShadow: playhead
                        ? `0 0 0 2px var(--foreground)`
                        : on
                        ? `0 0 14px ${t.color}88`
                        : "none",
                      marginLeft: si % 4 === 0 && si !== 0 ? "0.5rem" : undefined,
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
