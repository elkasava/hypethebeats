// Gedeelde Web Audio-engine voor de Funzone: drumsynthese (met genre-kits),
// melodische synth en master-volume/mute. Eén AudioContext + master-keten
// (gain → compressor) zodat gestapelde geluiden niet clippen.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

let masterVolume = 0.8;
let muted = false;
let currentKit: Kit = "pop";

export type DrumType = "kick" | "snare" | "hihat" | "clap";
export type Wave = "sine" | "triangle" | "sawtooth" | "square";
export type Kit = "pop" | "dancehall" | "house" | "boombap";

type KitParams = {
  kick: { f0: number; f1: number; dur: number; gain: number };
  snare: { hp: number; dur: number; toneFreq: number; toneGain: number; noiseGain: number };
  hihat: { hp: number; dur: number; gain: number };
  clap: { bp: number; dur: number; gain: number };
};

// Twee herkenbaar verschillende kits
const kits: Record<Kit, KitParams> = {
  pop: {
    kick: { f0: 160, f1: 55, dur: 0.18, gain: 1 },
    snare: { hp: 1800, dur: 0.18, toneFreq: 190, toneGain: 0.4, noiseGain: 0.6 },
    hihat: { hp: 8000, dur: 0.04, gain: 0.4 },
    clap: { bp: 1500, dur: 0.14, gain: 0.6 },
  },
  dancehall: {
    // Diepe, boomy kick, strakke snappy snare, crispe hats — riddim-vibe
    kick: { f0: 115, f1: 38, dur: 0.32, gain: 1.15 },
    snare: { hp: 1200, dur: 0.11, toneFreq: 250, toneGain: 0.5, noiseGain: 0.45 },
    hihat: { hp: 9500, dur: 0.03, gain: 0.45 },
    clap: { bp: 1000, dur: 0.2, gain: 0.6 },
  },
  house: {
    // Strakke punchy kick, heldere clap, open-ish hats
    kick: { f0: 145, f1: 50, dur: 0.2, gain: 1 },
    snare: { hp: 2000, dur: 0.16, toneFreq: 210, toneGain: 0.35, noiseGain: 0.6 },
    hihat: { hp: 8500, dur: 0.06, gain: 0.4 },
    clap: { bp: 1600, dur: 0.16, gain: 0.65 },
  },
  boombap: {
    // Dusty hiphop: warme kick, dikke snappy snare, loszittende hats
    kick: { f0: 135, f1: 46, dur: 0.24, gain: 1.05 },
    snare: { hp: 1000, dur: 0.22, toneFreq: 175, toneGain: 0.45, noiseGain: 0.7 },
    hihat: { hp: 7000, dur: 0.05, gain: 0.42 },
    clap: { bp: 1200, dur: 0.18, gain: 0.55 },
  },
};

export function getMaster(): AudioNode | null {
  getCtx();
  return master;
}

export function setKit(kit: Kit) {
  currentKit = kit;
}
export function getKit(): Kit {
  return currentKit;
}

function applyMasterGain() {
  if (master) master.gain.value = muted ? 0 : masterVolume;
}
export function setMasterVolume(v: number) {
  masterVolume = Math.max(0, Math.min(1, v));
  applyMasterGain();
}
export function setMuted(m: boolean) {
  muted = m;
  applyMasterGain();
}

export function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();

    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise = buffer;

    master = ctx.createGain();
    master.gain.value = muted ? 0 : masterVolume;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function playDrum(type: DrumType, time?: number, kit: Kit = currentKit) {
  const c = getCtx();
  if (!c || !master) return;
  const now = time ?? c.currentTime;
  const out = master;
  const p = kits[kit];

  if (type === "kick") {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.setValueAtTime(p.kick.f0, now);
    osc.frequency.exponentialRampToValueAtTime(p.kick.f1, now + p.kick.dur * 0.8);
    gain.gain.setValueAtTime(p.kick.gain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.kick.dur + 0.04);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + p.kick.dur + 0.06);
    return;
  }

  const src = c.createBufferSource();
  src.buffer = noise;
  const filter = c.createBiquadFilter();
  const gain = c.createGain();

  if (type === "hihat") {
    filter.type = "highpass";
    filter.frequency.value = p.hihat.hp;
    gain.gain.setValueAtTime(p.hihat.gain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.hihat.dur);
  } else if (type === "snare") {
    filter.type = "highpass";
    filter.frequency.value = p.snare.hp;
    gain.gain.setValueAtTime(p.snare.noiseGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.snare.dur);
    const tone = c.createOscillator();
    const tg = c.createGain();
    tone.type = "triangle";
    tone.frequency.value = p.snare.toneFreq;
    tg.gain.setValueAtTime(p.snare.toneGain, now);
    tg.gain.exponentialRampToValueAtTime(0.001, now + p.snare.dur);
    tone.connect(tg).connect(out);
    tone.start(now);
    tone.stop(now + p.snare.dur + 0.02);
  } else {
    filter.type = "bandpass";
    filter.frequency.value = p.clap.bp;
    gain.gain.setValueAtTime(p.clap.gain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.clap.dur);
  }

  src.connect(filter).connect(gain).connect(out);
  src.start(now);
  src.stop(now + 0.3);
}

export function playNote(freq: number, wave: Wave = "triangle", time?: number, dur = 0.9) {
  const c = getCtx();
  if (!c || !master) return;
  const now = time ?? c.currentTime;
  const out = master;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  const peak = wave === "sawtooth" || wave === "square" ? 0.22 : 0.32;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain).connect(out);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}
