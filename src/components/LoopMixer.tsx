"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCtx, getMaster } from "@/lib/funzoneAudio";

// Loop-mixer: meerdere gesynthetiseerde loops (zang, drums, synth, fluit,
// percussie) die strak in de maat samen loopen. Per laag aan/uit + volume.

const STEPS = 16;

type Ctx = AudioContext;

// ── Synthese-helpers ────────────────────────────────────────────────
function tone(
  ctx: Ctx,
  dest: AudioNode,
  freq: number,
  time: number,
  dur: number,
  wave: OscillatorType,
  peak: number,
  attack = 0.01
) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = wave;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(peak, time + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  o.connect(g).connect(dest);
  o.start(time);
  o.stop(time + dur + 0.05);
}

function noiseHit(
  ctx: Ctx,
  dest: AudioNode,
  buffer: AudioBuffer,
  time: number,
  dur: number,
  type: BiquadFilterType,
  freq: number,
  peak: number
) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(peak, time);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  src.connect(f).connect(g).connect(dest);
  src.start(time);
  src.stop(time + dur + 0.05);
}

// Noten (Hz)
const N = {
  C3: 130.81, E3: 164.81, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5,
};

type Track = {
  id: string;
  name: string;
  color: string;
  play: (ctx: Ctx, dest: AudioNode, step: number, time: number, sec16: number, vol: number, noise: AudioBuffer) => void;
};

const tracks: Track[] = [
  {
    id: "drums",
    name: "Drums",
    color: "#84cc16",
    play: (ctx, dest, step, time, _s, vol, noise) => {
      if (step % 4 === 0) {
        // kick
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(150, time);
        o.frequency.exponentialRampToValueAtTime(50, time + 0.13);
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        o.connect(g).connect(dest);
        o.start(time);
        o.stop(time + 0.22);
      }
      if (step === 4 || step === 12) {
        noiseHit(ctx, dest, noise, time, 0.18, "highpass", 1600, 0.6 * vol);
        tone(ctx, dest, 190, time, 0.15, "triangle", 0.35 * vol);
      }
      if (step % 2 === 0) noiseHit(ctx, dest, noise, time, 0.04, "highpass", 8000, 0.3 * vol);
    },
  },
  {
    id: "perc",
    name: "Percussie",
    color: "#ff7a1a",
    play: (ctx, dest, step, time, _s, vol, noise) => {
      // shaker op de "en"-tellen
      if (step % 4 === 2) noiseHit(ctx, dest, noise, time, 0.06, "highpass", 6000, 0.35 * vol);
      // conga-tikjes
      if (step === 3 || step === 11) tone(ctx, dest, 320, time, 0.18, "sine", 0.4 * vol);
      if (step === 7) tone(ctx, dest, 260, time, 0.2, "sine", 0.4 * vol);
    },
  },
  {
    id: "synth",
    name: "Synth",
    color: "#2563eb",
    play: (ctx, dest, step, time, _s, vol) => {
      // Akkoord-stabs: Cmaj op 0/8, Amin op 4/12
      const stab = (freqs: number[]) =>
        freqs.forEach((f) => tone(ctx, dest, f, time, 0.45, "sawtooth", 0.12 * vol, 0.008));
      if (step === 0 || step === 8) stab([N.C4, N.E4, N.G4]);
      if (step === 4 || step === 12) stab([N.A3, N.C4, N.E4]);
    },
  },
  {
    id: "fluit",
    name: "Fluit",
    color: "#ff5da2",
    play: (ctx, dest, step, time, _s, vol) => {
      // Eenvoudige melodie-motief
      const mel: Record<number, number> = { 0: N.E5, 3: N.G5, 6: N.C6, 8: N.A5, 11: N.G5, 14: N.E5 };
      const f = mel[step];
      if (f) tone(ctx, dest, f, time, 0.4, "sine", 0.28 * vol, 0.04);
    },
  },
  {
    id: "zang",
    name: "Zang",
    color: "#a855f7",
    play: (ctx, dest, step, time, sec16, vol) => {
      // "Aah"-pad: lang akkoord met formant-filter, één keer per maat
      if (step !== 0) return;
      const dur = sec16 * 16;
      const formant = ctx.createBiquadFilter();
      formant.type = "bandpass";
      formant.frequency.value = 800;
      formant.Q.value = 6;
      formant.connect(dest);
      [N.C4, N.E4, N.G4].forEach((f) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sawtooth";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.06 * vol, time + 0.25);
        g.gain.setValueAtTime(0.06 * vol, time + dur - 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        o.connect(g).connect(formant);
        o.start(time);
        o.stop(time + dur + 0.05);
      });
    },
  },
];

export default function LoopMixer() {
  const [bpm, setBpm] = useState(110);
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState<boolean[]>(() => tracks.map((_, i) => i < 3));
  const [volume, setVolume] = useState<number[]>(() => tracks.map(() => 0.8));
  const [currentStep, setCurrentStep] = useState(-1);

  const enabledRef = useRef(enabled);
  const volumeRef = useRef(volume);
  const bpmRef = useRef(bpm);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const nextNoteTimeRef = useRef(0);
  const stepRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const queueRef = useRef<{ step: number; time: number }[]>([]);
  const shownRef = useRef(-1);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const ensureNoise = useCallback((ctx: AudioContext) => {
    if (!noiseRef.current) {
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseRef.current = buf;
    }
    return noiseRef.current;
  }, []);

  const schedule = useCallback(() => {
    const ctx = getCtx();
    const master = getMaster();
    if (!ctx || !master) return;
    const noise = ensureNoise(ctx);
    const scheduleAhead = 0.12;
    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAhead) {
      const step = stepRef.current;
      const time = nextNoteTimeRef.current;
      const sec16 = (60 / bpmRef.current) * 0.25;
      tracks.forEach((t, i) => {
        if (enabledRef.current[i]) t.play(ctx, master, step, time, sec16, volumeRef.current[i], noise);
      });
      queueRef.current.push({ step, time });
      nextNoteTimeRef.current += sec16;
      stepRef.current = (step + 1) % STEPS;
    }
    timerRef.current = window.setTimeout(schedule, 25);
  }, [ensureNoise]);

  const draw = useCallback(() => {
    const ctx = getCtx();
    if (ctx) {
      const now = ctx.currentTime;
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
    const ctx = getCtx();
    if (!ctx) return;
    setPlaying(true);
    stepRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.08;
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

  const toggleTrack = (i: number) =>
    setEnabled((prev) => prev.map((v, j) => (j === i ? !v : v)));
  const setVol = (i: number, val: number) =>
    setVolume((prev) => prev.map((v, j) => (j === i ? val : v)));

  return (
    <div className="rounded-2xl border border-foreground/10 bg-[#111110] p-5 text-white sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h2 className="font-display text-2xl font-bold tracking-tight">Loop-mixer</h2>
          </div>
          <p className="mt-1 text-sm text-white/55">
            Zet lagen aan/uit en meng je eigen track — alles loopt strak samen
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
        </div>
      </div>

      {/* BPM + stappen-indicator */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-white/45">BPM</span>
          <input
            type="range"
            min={70}
            max={150}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="h-1.5 w-36 cursor-pointer appearance-none rounded-full bg-white/15 accent-accent"
          />
          <span className="w-9 font-display text-base font-black tabular-nums">{bpm}</span>
        </label>
        <div className="flex gap-1">
          {Array.from({ length: STEPS }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-colors"
              style={{ background: playing && currentStep === i ? "#84cc16" : "rgba(255,255,255,0.18)" }}
            />
          ))}
        </div>
      </div>

      {/* Lagen */}
      <div className="mt-6 space-y-2.5">
        {tracks.map((t, i) => {
          const on = enabled[i];
          return (
            <div
              key={t.id}
              className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors"
              style={{ background: on ? `${t.color}1f` : "rgba(255,255,255,0.04)" }}
            >
              <button
                onClick={() => toggleTrack(i)}
                aria-pressed={on}
                className="flex w-28 shrink-0 items-center gap-2.5 text-left"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-[#111110] transition-opacity"
                  style={{ background: t.color, opacity: on ? 1 : 0.3 }}
                >
                  {on ? "♪" : ""}
                </span>
                <span className={`font-display text-sm font-bold ${on ? "text-white" : "text-white/40"}`}>
                  {t.name}
                </span>
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume[i]}
                onChange={(e) => setVol(i, Number(e.target.value))}
                aria-label={`${t.name} volume`}
                disabled={!on}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 disabled:opacity-40"
                style={{ accentColor: t.color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
