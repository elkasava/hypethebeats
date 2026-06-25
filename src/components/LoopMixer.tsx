"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCtx, getMaster, setMasterVolume } from "@/lib/funzoneAudio";

// Verticale studio-mixer met echte channel-strip onderdelen: 3-bands EQ,
// pan, reverb-send, solo/mute, dB-schaal en clip-LED's. Alle loops worden
// live gesynthetiseerd (geen audiobestanden).

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
  G1: 49.0, A1: 55.0, C2: 65.41, E2: 82.41,
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
    id: "bass", name: "Bass", color: "#eab308",
    play: (ctx, dest, step, time) => {
      const seq: Record<number, number> = { 0: N.C2, 3: N.C2, 6: N.E2, 8: N.A1, 11: N.A1, 14: N.G1 };
      const f = seq[step];
      if (f) {
        tone(ctx, dest, f, time, 0.32, "triangle", 0.5, 0.005);
        tone(ctx, dest, f / 2, time, 0.34, "sine", 0.3, 0.005); // sub
      }
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
      [N.C4, N.E4, N.G4].forEach((f) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sawtooth";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.1, time + 0.25);
        g.gain.setValueAtTime(0.1, time + dur - 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        o.connect(g).connect(dest);
        o.start(time);
        o.stop(time + dur + 0.05);
      });
    },
  },
];

const TN = tracks.length;
const dbText = (v: number) => (v <= 0.001 ? "-∞" : (20 * Math.log10(v)).toFixed(1));

// ── Rotary knob ─────────────────────────────────────────────────────
function Knob({
  value, onChange, color, label, center,
}: { value: number; onChange: (v: number) => void; color: string; label: string; center?: boolean }) {
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startVal = value;
    const move = (ev: PointerEvent) => onChange(Math.max(0, Math.min(1, startVal + (startY - ev.clientY) / 140)));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const angle = -135 + value * 270;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        onPointerDown={onPointerDown}
        onDoubleClick={() => onChange(center ? 0.5 : value)}
        role="slider"
        aria-valuenow={Math.round(value * 100)}
        aria-label={label}
        tabIndex={0}
        className="relative h-7 w-7 cursor-ns-resize rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 35%, #3a3a38, #161615)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)",
        }}
      >
        <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
          <span className="absolute left-1/2 top-0.5 h-2 w-[2.5px] -translate-x-1/2 rounded-full" style={{ background: color }} />
        </div>
      </div>
      <span className="text-[7px] font-bold uppercase tracking-widest text-white/40">{label}</span>
    </div>
  );
}

function Fader({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="relative flex w-8 items-center justify-center">
      <input
        type="range" min={0} max={1} step={0.01} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="fader absolute w-[150px] cursor-pointer"
        style={{ transform: "rotate(-90deg)" }}
      />
    </div>
  );
}

export default function LoopMixer() {
  const [bpm, setBpm] = useState(110);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState<number[]>([0.85, 0.6, 0.8, 0.6, 0.5, 0.45]);
  const [eqLow, setEqLow] = useState<number[]>(Array(TN).fill(0.5));
  const [eqMid, setEqMid] = useState<number[]>(Array(TN).fill(0.5));
  const [eqHigh, setEqHigh] = useState<number[]>(Array(TN).fill(0.5));
  const [pan, setPan] = useState<number[]>(Array(TN).fill(0.5));
  const [send, setSend] = useState<number[]>([0.1, 0.12, 0.04, 0.2, 0.28, 0.3]);
  const [mute, setMute] = useState<boolean[]>(Array(TN).fill(false));
  const [solo, setSolo] = useState<boolean[]>(Array(TN).fill(false));
  const [masterVol, setMasterVol] = useState(0.8);
  const [currentStep, setCurrentStep] = useState(-1);

  const bpmRef = useRef(bpm);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const inRef = useRef<BiquadFilterNode[]>([]); // EQ low = channel input
  const midRef = useRef<BiquadFilterNode[]>([]);
  const highRef = useRef<BiquadFilterNode[]>([]);
  const panRef = useRef<StereoPannerNode[]>([]);
  const gainRef = useRef<GainNode[]>([]);
  const sendRef = useRef<GainNode[]>([]);
  const analyserRef = useRef<AnalyserNode[]>([]);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);

  const meterEls = useRef<(HTMLDivElement | null)[]>([]);
  const clipEls = useRef<(HTMLDivElement | null)[]>([]);
  const masterMeterEl = useRef<HTMLDivElement | null>(null);
  const smoothRef = useRef<number[]>(Array(TN + 1).fill(0));
  const clipUntil = useRef<number[]>(Array(TN + 1).fill(0));
  const bufRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const nextNoteTimeRef = useRef(0);
  const stepRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const queueRef = useRef<{ step: number; time: number }[]>([]);
  const shownRef = useRef(-1);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  // Audio-keten opzetten
  useEffect(() => {
    const ctx = getCtx();
    const master = getMaster();
    if (!ctx || !master) return;

    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const dd = buf.getChannelData(0);
    for (let i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1;
    noiseRef.current = buf;
    bufRef.current = new Uint8Array(new ArrayBuffer(256));

    // Gedeelde reverb-bus
    const irLen = ctx.sampleRate * 1.8;
    const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.5);
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = ir;
    const reverbReturn = ctx.createGain();
    reverbReturn.gain.value = 0.9;
    convolver.connect(reverbReturn).connect(master);

    tracks.forEach((_, i) => {
      const low = ctx.createBiquadFilter(); low.type = "lowshelf"; low.frequency.value = 250;
      const mid = ctx.createBiquadFilter(); mid.type = "peaking"; mid.frequency.value = 1200; mid.Q.value = 1;
      const high = ctx.createBiquadFilter(); high.type = "highshelf"; high.frequency.value = 4500;
      const panner = ctx.createStereoPanner();
      const g = ctx.createGain();
      const a = ctx.createAnalyser(); a.fftSize = 256;
      const s = ctx.createGain(); s.gain.value = send[i] * 0.6;
      g.gain.value = mute[i] ? 0 : volume[i];

      low.connect(mid).connect(high).connect(panner).connect(g).connect(a).connect(master);
      g.connect(s).connect(convolver);

      inRef.current[i] = low; midRef.current[i] = mid; highRef.current[i] = high;
      panRef.current[i] = panner; gainRef.current[i] = g; analyserRef.current[i] = a; sendRef.current[i] = s;
    });

    const ma = ctx.createAnalyser(); ma.fftSize = 256;
    master.connect(ma);
    masterAnalyserRef.current = ma;

    return () => {
      gainRef.current.forEach((g) => g?.disconnect());
      analyserRef.current.forEach((a) => a?.disconnect());
      sendRef.current.forEach((s) => s?.disconnect());
      convolver.disconnect();
      masterAnalyserRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI → nodes
  useEffect(() => {
    const anySolo = solo.some(Boolean);
    volume.forEach((v, i) => {
      const g = gainRef.current[i];
      if (g) g.gain.value = anySolo ? (solo[i] ? v : 0) : mute[i] ? 0 : v;
    });
  }, [volume, mute, solo]);
  useEffect(() => { eqLow.forEach((v, i) => { const f = inRef.current[i]; if (f) f.gain.value = (v - 0.5) * 24; }); }, [eqLow]);
  useEffect(() => { eqMid.forEach((v, i) => { const f = midRef.current[i]; if (f) f.gain.value = (v - 0.5) * 24; }); }, [eqMid]);
  useEffect(() => { eqHigh.forEach((v, i) => { const f = highRef.current[i]; if (f) f.gain.value = (v - 0.5) * 24; }); }, [eqHigh]);
  useEffect(() => { pan.forEach((v, i) => { const p = panRef.current[i]; if (p) p.pan.value = (v - 0.5) * 2; }); }, [pan]);
  useEffect(() => { send.forEach((v, i) => { const s = sendRef.current[i]; if (s) s.gain.value = v * 0.6; }); }, [send]);
  useEffect(() => { setMasterVolume(masterVol); }, [masterVol]);

  const schedule = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !noiseRef.current) return;
    while (nextNoteTimeRef.current < ctx.currentTime + 0.12) {
      const step = stepRef.current;
      const time = nextNoteTimeRef.current;
      const sec16 = (60 / bpmRef.current) * 0.25;
      tracks.forEach((t, i) => {
        const dest = inRef.current[i];
        if (dest) t.play(ctx, dest, step, time, sec16, noiseRef.current!);
      });
      queueRef.current.push({ step, time });
      nextNoteTimeRef.current += sec16;
      stepRef.current = (step + 1) % STEPS;
    }
    timerRef.current = window.setTimeout(schedule, 25);
  }, []);

  const readMeter = (a: AnalyserNode | null, idx: number, el: HTMLDivElement | null, clip: HTMLDivElement | null) => {
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
    if (clip) {
      const now = performance.now();
      if (lvl > 0.94) clipUntil.current[idx] = now + 800;
      clip.style.background = now < clipUntil.current[idx] ? "#ef4444" : "rgba(255,255,255,0.12)";
    }
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
      analyserRef.current.forEach((a, i) => readMeter(a, i, meterEls.current[i], clipEls.current[i]));
      readMeter(masterAnalyserRef.current, TN, masterMeterEl.current, null);
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
  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean[]>>, i: number) =>
    setter((prev) => prev.map((p, j) => (j === i ? !p : p)));

  const Meter = ({ mRef, cRef }: { mRef: (el: HTMLDivElement | null) => void; cRef?: (el: HTMLDivElement | null) => void }) => (
    <div className="flex flex-col items-center gap-1">
      <div ref={cRef} className="h-1.5 w-2.5 rounded-sm" style={{ background: "rgba(255,255,255,0.12)" }} />
      <div className="relative h-[136px] w-2.5 overflow-hidden rounded-full bg-black/50">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #22c55e 0%, #22c55e 55%, #eab308 78%, #ef4444 100%)" }} />
        <div ref={mRef} className="absolute inset-x-0 top-0 bg-[#111110]" style={{ height: "100%" }} />
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-foreground/10 bg-[#111110] p-5 text-white sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h2 className="font-display text-2xl font-bold tracking-tight">Loop-mixer</h2>
          </div>
          <p className="mt-1 text-sm text-white/55">
            Volwaardige mini-mengtafel — EQ, pan, reverb, solo/mute en faders met dB
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-white/45">BPM</span>
            <input type="range" min={70} max={150} value={bpm} onChange={(e) => setBpm(Number(e.target.value))}
              className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-white/15 accent-accent" />
            <span className="w-9 font-display text-base font-black tabular-nums">{bpm}</span>
          </label>
          <button onClick={() => (playing ? stop() : start())} aria-label={playing ? "Stop" : "Play"}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-[#111110] transition-transform hover:scale-105 active:scale-95">
            {playing ? "■" : "▶"}
          </button>
        </div>
      </div>

      {/* Console */}
      <div className="mt-6 flex gap-2.5 overflow-x-auto pb-2">
        {tracks.map((t, i) => (
          <div key={t.id} className="flex w-[92px] shrink-0 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: t.color }}>{t.name}</span>

            {/* EQ */}
            <div className="flex items-start justify-center gap-1">
              <Knob value={eqLow[i]} onChange={(v) => upd(setEqLow, i, v)} color={t.color} label="Lo" center />
              <Knob value={eqMid[i]} onChange={(v) => upd(setEqMid, i, v)} color={t.color} label="Mid" center />
              <Knob value={eqHigh[i]} onChange={(v) => upd(setEqHigh, i, v)} color={t.color} label="Hi" center />
            </div>
            {/* Pan + Send */}
            <div className="flex items-start justify-center gap-2">
              <Knob value={pan[i]} onChange={(v) => upd(setPan, i, v)} color="#ffffff" label="Pan" center />
              <Knob value={send[i]} onChange={(v) => upd(setSend, i, v)} color="#22d3ee" label="Verb" />
            </div>

            {/* Meter + fader */}
            <div className="mt-1 flex items-stretch gap-2">
              <Meter mRef={(el) => { meterEls.current[i] = el; }} cRef={(el) => { clipEls.current[i] = el; }} />
              <Fader value={volume[i]} onChange={(v) => upd(setVolume, i, v)} label={`${t.name} volume`} />
            </div>
            <span className="font-mono text-[9px] tabular-nums text-white/45">{dbText(volume[i])} dB</span>

            {/* Solo + Mute */}
            <div className="flex w-full gap-1">
              <button onClick={() => toggle(setSolo, i)} aria-pressed={solo[i]}
                className={`flex-1 rounded-md py-1 text-[9px] font-black uppercase tracking-widest transition-colors ${solo[i] ? "bg-yellow-400 text-[#111110]" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                Solo
              </button>
              <button onClick={() => toggle(setMute, i)} aria-pressed={mute[i]}
                className={`flex-1 rounded-md py-1 text-[9px] font-black uppercase tracking-widest transition-colors ${mute[i] ? "bg-red-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                Mute
              </button>
            </div>
          </div>
        ))}

        {/* Master */}
        <div className="flex w-[92px] shrink-0 flex-col items-center gap-2 rounded-xl border border-accent/30 bg-accent/[0.06] p-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-accent">Master</span>
          <div className="h-[58px]" />
          <div className="mt-1 flex items-stretch gap-2">
            <Meter mRef={(el) => { masterMeterEl.current = el; }} />
            <Fader value={masterVol} onChange={setMasterVol} label="Master volume" />
          </div>
          <span className="font-mono text-[9px] tabular-nums text-white/45">{dbText(masterVol)} dB</span>
          <div className="flex w-full justify-center gap-1 pt-1">
            {Array.from({ length: 4 }).map((_, k) => (
              <span key={k} className="h-1.5 w-1.5 rounded-full"
                style={{ background: playing && currentStep >= 0 && Math.floor(currentStep / 4) === k ? "#84cc16" : "rgba(255,255,255,0.18)" }} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-white/40">Tip: sleep knoppen verticaal · dubbelklik zet EQ/Pan terug op het midden.</p>
    </div>
  );
}
