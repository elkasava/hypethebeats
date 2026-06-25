// Gedeelde Web Audio-engine voor de Funzone: drumsynthese + melodische synth.
// Eén AudioContext + master-keten (gain → compressor) zodat gestapelde
// geluiden (bijv. in de sequencer) niet clippen.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

export type DrumType = "kick" | "snare" | "hihat" | "clap";
export type Wave = "sine" | "triangle" | "sawtooth" | "square";

export function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();

    // Witte-ruis buffer (1 sec) voor snare/hihat/clap
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise = buffer;

    // Master-keten
    master = ctx.createGain();
    master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function dest(): AudioNode | null {
  return master;
}

export function playDrum(type: DrumType, time?: number) {
  const c = getCtx();
  if (!c || !master) return;
  const now = time ?? c.currentTime;
  const out = dest()!;

  if (type === "kick") {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + 0.24);
    return;
  }

  const src = c.createBufferSource();
  src.buffer = noise;
  const filter = c.createBiquadFilter();
  const gain = c.createGain();

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
    const tone = c.createOscillator();
    const tg = c.createGain();
    tone.type = "triangle";
    tone.frequency.value = 180;
    tg.gain.setValueAtTime(0.4, now);
    tg.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    tone.connect(tg).connect(out);
    tone.start(now);
    tone.stop(now + 0.16);
  } else {
    // clap
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  }

  src.connect(filter).connect(gain).connect(out);
  src.start(now);
  src.stop(now + 0.3);
}

export function playNote(freq: number, wave: Wave = "triangle", time?: number, dur = 0.9) {
  const c = getCtx();
  if (!c || !master) return;
  const now = time ?? c.currentTime;
  const out = dest()!;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  // Zachtere aanzet voor scherpe golven (saw/square) om clippen te voorkomen
  const peak = wave === "sawtooth" || wave === "square" ? 0.22 : 0.32;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain).connect(out);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}
