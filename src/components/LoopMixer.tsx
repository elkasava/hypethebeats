"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCtx, getMaster, setMasterVolume } from "@/lib/funzoneAudio";

// Verticale studio-mixer: gesynthetiseerde loops (Drums, Percussie, Synth,
// Fluit, Zang) als kanaalstrips met tone-knop, VU-meter, fader en mute.

const STEPS = 16;
type Ctx = AudioContext;

function tone(
  ctx: Ctx, dest: AudioNode, freq: number, time: number, dur: number,
  wave: OscillatorType, peak: number, attack = 0.01
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
  ctx: Ctx, dest: AudioNode, buffer: AudioBuffer, time: number, dur: number,
  type: BiquadFilterType, freq: number, peak: number
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

const N = {
  C3: 130.81, E3: 164.81, G3: 196.0, A3: 220.0,
  C4: 261.63, E4: 329.63, G4: 392.0, A4: 440.0,
  E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5,
};

type Track = {
  id: string; name: string; color: string;
  play: (ctx: Ctx, dest: AudioNode, step: number, time: number, sec16: number, noise: AudioBuffer) => void;
};

const tracks: Track[] = [
  {
    id: "drums", name: "Drums", color: "#84cc16",
    play: (ctx, dest, step, time, _s, noise) => {
      if (step % 4 === 0) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(150, time);
        o.frequency.exponentialRampToValueAtTime(50, time + 0.13);
        g.gain.setValueAtTime(1, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        o.connect(g).connect(dest);
        o.start(time);
        o.stop(time + 0.22);
      }
      if (step === 4 || step === 12) {
        noiseHit(ctx, dest, noise, time, 0.18, "highpass", 1600, 0.6);
        tone(ctx, dest, 190, time, 0.15, "triangle", 0.35);
      }
      if (step % 2 === 0) noiseHit(ctx, dest, noise, time, 0.04, "highpass", 8000, 0.3);
    },
  },
  {
    id: "perc", name: "Percussie", color: "#ff7a1a",
    play: (ctx, dest, step, time, _s, noise) => {
      if (step % 4 === 2) noiseHit(ctx, dest, noise, time, 0.06, "highpass", 6000, 0.4);
      if (step === 3 || step === 11) tone(ctx, dest, 320, time, 0.18, "sine", 0.45);
      if (step === 7) tone(ctx, dest, 260, time, 0.2, "sine", 0.45);
    },
  },
  {
    id: "synth", name: "Synth", color: "#2563eb",
    play: (ctx, dest, step, time) => {
      const stab = (freqs: number[]) =>
        freqs.forEach((f) => tone(ctx, dest, f, time, 0.45, "sawtooth", 0.16, 0.008));
      if (step === 0 || step === 8) stab([N.C4, N.E4, N.G4]);
      if (step === 4 || step === 12) stab([N.A3, N.C4, N.E4]);
    },
  },
  {
    id: "fluit", name: "Fluit", color: "#ff5da2",
    play: (ctx, dest, step, time) => {
      const mel: Record<number, number> = { 0: N.E5, 3: N.G5, 6: N.C6, 8: N.A5, 11: N.G5, 14: N.E5 };
      const f = mel[step];
      if (f) tone(ctx, dest, f, time, 0.4, "sine", 0.4, 0.04);
    },
  },
  {
    id: "zang", name: "Zang", color: "#a855f7",
    play: (ctx, dest, step, time, sec16) => {
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
        g.gain.linearRampToValueAtTime(0.12, time + 0.25);
        g.gain.setValueAtTime(0.12, time + dur - 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        o.connect(g).connect(formant);
        o.start(time);
        o.stop(time + dur + 0.05);
      });
    },
  },
];

const toneToFreq = (v: number) => 200 * Math.pow(90, v); // 200Hz .. 18kHz

// ── Rotary knob ─────────────────────────────────────────────────────
function Knob({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startVal = value;
    const move = (ev: PointerEvent) => {
      const dy = startY - ev.clientY;
      onChange(Math.max(0, Math.min(1, startVal + dy / 140)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const angle = -135 + value * 270;
  return (
    <div
      onPointerDown={onPointerDown}
      role="slider"
      aria-valuenow={Math.round(value * 100)}
      aria-label="Tone"
      tabIndex={0}
      className="relative h-9 w-9 cursor-ns-resize rounded-full"
      style={{
        background: "radial-gradient(circle at 50% 35%, #3a3a38, #161615)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)",
      }}
    >
      <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
        <span
          className="absolute left-1/2 top-1 h-2.5 w-[3px] -translate-x-1/2 rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ── Kanaalstrip ─────────────────────────────────────────────────────
function Channel({
  name, color, volume, toneVal, muted, onVolume, onTone, onMute, meterRef,
}: {
  name: string; color: string; volume: number; toneVal: number; muted: boolean;
  onVolume: (v: number) => void; onTone: (v: number) => void; onMute: () => void;
  meterRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div className="flex w-[78px] shrink-0 flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color }}>
        {name}
      </span>
      <Knob value={toneVal} onChange={onTone} color={color} />
      <span className="text-[8px] font-bold uppercase tracking-widest text-white/35">Tone</span>

      <div className="flex h-[150px] items-stretch gap-2">
        {/* VU-meter */}
        <div className="relative w-2.5 overflow-hidden rounded-full bg-black/50">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, #22c55e 0%, #22c55e 55%, #eab308 78%, #ef4444 100%)" }}
          />
          <div ref={meterRef} className="absolute inset-x-0 top-0 bg-[#111110]" style={{ height: "100%" }} />
        </div>
        {/* Fader */}
        <div className="relative flex w-9 items-center justify-center">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            aria-label={`${name} volume`}
            className="fader absolute w-[150px] cursor-pointer"
            style={{ transform: "rotate(-90deg)" }}
          />
        </div>
      </div>

      <button
        onClick={onMute}
        aria-pressed={muted}
        aria-label={`${name} ${muted ? "aan" : "dempen"}`}
        className={`w-full rounded-md py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
          muted ? "bg-red-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
        }`}
      >
        {muted ? "Muted" : "Mute"}
      </button>
    </div>
  );
}

export default function LoopMixer() {
  const [bpm, setBpm] = useState(110);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState<number[]>([0.85, 0.6, 0.6, 0.5, 0.45]);
  const [toneVals, setToneVals] = useState<number[]>(tracks.map(() => 1));
  const [muted, setMuted] = useState<boolean[]>(tracks.map(() => false));
  const [masterVol, setMasterVol] = useState(0.8);
  const [currentStep, setCurrentStep] = useState(-1);

  const bpmRef = useRef(bpm);
  const mutedRef = useRef(muted);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const gainsRef = useRef<GainNode[]>([]);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const analysersRef = useRef<AnalyserNode[]>([]);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const meterEls = useRef<(HTMLDivElement | null)[]>([]);
  const masterMeterEl = useRef<HTMLDivElement | null>(null);
  const smoothRef = useRef<number[]>(tracks.map(() => 0).concat(0));
  const bufRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const nextNoteTimeRef = useRef(0);
  const stepRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const queueRef = useRef<{ step: number; time: number }[]>([]);
  const shownRef = useRef(-1);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // Audio-keten opzetten: per kanaal gain → lowpass → analyser → master
  useEffect(() => {
    const ctx = getCtx();
    const master = getMaster();
    if (!ctx || !master) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseRef.current = buf;
    bufRef.current = new Uint8Array(new ArrayBuffer(256));

    tracks.forEach((_, i) => {
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = toneToFreq(toneVals[i]);
      const a = ctx.createAnalyser();
      a.fftSize = 256;
      g.gain.value = muted[i] ? 0 : volume[i];
      g.connect(f).connect(a).connect(master);
      gainsRef.current[i] = g;
      filtersRef.current[i] = f;
      analysersRef.current[i] = a;
    });
    const ma = ctx.createAnalyser();
    ma.fftSize = 256;
    master.connect(ma);
    masterAnalyserRef.current = ma;

    return () => {
      gainsRef.current.forEach((g) => g?.disconnect());
      analysersRef.current.forEach((a) => a?.disconnect());
      masterAnalyserRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI → audio-nodes
  useEffect(() => {
    volume.forEach((v, i) => {
      const g = gainsRef.current[i];
      if (g) g.gain.value = muted[i] ? 0 : v;
    });
  }, [volume, muted]);
  useEffect(() => {
    toneVals.forEach((v, i) => {
      const f = filtersRef.current[i];
      if (f) f.frequency.value = toneToFreq(v);
    });
  }, [toneVals]);
  useEffect(() => { setMasterVolume(masterVol); }, [masterVol]);

  const schedule = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !noiseRef.current) return;
    const scheduleAhead = 0.12;
    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAhead) {
      const step = stepRef.current;
      const time = nextNoteTimeRef.current;
      const sec16 = (60 / bpmRef.current) * 0.25;
      tracks.forEach((t, i) => {
        const dest = gainsRef.current[i];
        if (dest && !mutedRef.current[i]) t.play(ctx, dest, step, time, sec16, noiseRef.current!);
      });
      queueRef.current.push({ step, time });
      nextNoteTimeRef.current += sec16;
      stepRef.current = (step + 1) % STEPS;
    }
    timerRef.current = window.setTimeout(schedule, 25);
  }, []);

  const readMeter = (a: AnalyserNode | null, idx: number, el: HTMLDivElement | null) => {
    if (!a || !el || !bufRef.current) return;
    a.getByteTimeDomainData(bufRef.current);
    let sum = 0;
    for (let k = 0; k < bufRef.current.length; k++) {
      const x = (bufRef.current[k] - 128) / 128;
      sum += x * x;
    }
    const rms = Math.sqrt(sum / bufRef.current.length);
    let lvl = Math.min(1, rms * 3.6);
    lvl = Math.max(lvl, smoothRef.current[idx] * 0.86);
    smoothRef.current[idx] = lvl;
    el.style.height = `${(1 - lvl) * 100}%`;
  };

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
      analysersRef.current.forEach((a, i) => readMeter(a, i, meterEls.current[i]));
      readMeter(masterAnalyserRef.current, tracks.length, masterMeterEl.current);
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

  const upd = (setter: React.Dispatch<React.SetStateAction<number[]>>, i: number, v: number) =>
    setter((prev) => prev.map((p, j) => (j === i ? v : p)));

  return (
    <div className="rounded-2xl border border-foreground/10 bg-[#111110] p-5 text-white sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h2 className="font-display text-2xl font-bold tracking-tight">Loop-mixer</h2>
          </div>
          <p className="mt-1 text-sm text-white/55">
            Een mini mengtafel — schuif de faders, draai de tone-knop en meng je eigen loop
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-white/45">BPM</span>
            <input
              type="range" min={70} max={150} value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-white/15 accent-accent"
            />
            <span className="w-9 font-display text-base font-black tabular-nums">{bpm}</span>
          </label>
          <button
            onClick={() => (playing ? stop() : start())}
            aria-label={playing ? "Stop" : "Play"}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-[#111110] transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? "■" : "▶"}
          </button>
        </div>
      </div>

      {/* Console */}
      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {tracks.map((t, i) => (
          <Channel
            key={t.id}
            name={t.name}
            color={t.color}
            volume={volume[i]}
            toneVal={toneVals[i]}
            muted={muted[i]}
            onVolume={(v) => upd(setVolume, i, v)}
            onTone={(v) => upd(setToneVals, i, v)}
            onMute={() => setMuted((prev) => prev.map((m, j) => (j === i ? !m : m)))}
            meterRef={(el) => {
              meterEls.current[i] = el;
            }}
          />
        ))}

        {/* Master-strip */}
        <div className="flex w-[78px] shrink-0 flex-col items-center gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] p-3">
          <span className="text-[11px] font-bold uppercase tracking-wide text-accent">Master</span>
          <div className="h-9" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-white/35">Out</span>
          <div className="flex h-[150px] items-stretch gap-2">
            <div className="relative w-2.5 overflow-hidden rounded-full bg-black/50">
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, #22c55e 0%, #22c55e 55%, #eab308 78%, #ef4444 100%)" }}
              />
              <div ref={masterMeterEl} className="absolute inset-x-0 top-0 bg-[#111110]" style={{ height: "100%" }} />
            </div>
            <div className="relative flex w-9 items-center justify-center">
              <input
                type="range" min={0} max={1} step={0.01} value={masterVol}
                onChange={(e) => setMasterVol(Number(e.target.value))}
                aria-label="Master volume"
                className="fader absolute w-[150px] cursor-pointer"
                style={{ transform: "rotate(-90deg)" }}
              />
            </div>
          </div>
          <div className="flex w-full justify-center gap-1">
            {Array.from({ length: 4 }).map((_, k) => (
              <span
                key={k}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: playing && currentStep >= 0 && Math.floor(currentStep / 4) === k ? "#84cc16" : "rgba(255,255,255,0.18)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
