// Gedeelde Web Audio-engine voor de Funzone: drumsynthese (met genre-kits),
// melodische synth en master-volume/mute. Eén AudioContext + master-keten
// (gain → compressor) zodat gestapelde geluiden niet clippen.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let delayInput: GainNode | null = null;
let reverbInput: GainNode | null = null;

let masterVolume = 0.8;
let muted = false;
let currentKit: Kit = "pop";

export type DrumType =
  | "kick"
  | "snare"
  | "hihat"
  | "clap"
  | "rim"
  | "bongo"
  | "clave"
  | "conga"
  | "cowbell"
  | "guiro";
export type Wave = "sine" | "triangle" | "sawtooth" | "square";
export type Kit = "pop" | "dancehall" | "house" | "boombap" | "reggae" | "salsa";
export type DrumFx = { delay?: number; reverb?: number };

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
  reggae: {
    // Diepe one-drop kick, losse rimshot-achtige snare, droge skank-hats
    kick: { f0: 150, f1: 48, dur: 0.34, gain: 1.1 },
    snare: { hp: 1400, dur: 0.16, toneFreq: 200, toneGain: 0.35, noiseGain: 0.5 },
    hihat: { hp: 9000, dur: 0.035, gain: 0.35 },
    clap: { bp: 1300, dur: 0.22, gain: 0.55 },
  },
  salsa: {
    // Drumkit speelt hier een kleine rol — de percussie (clave/conga/cowbell/guiro) draagt het ritme
    kick: { f0: 140, f1: 50, dur: 0.2, gain: 0.9 },
    snare: { hp: 1600, dur: 0.14, toneFreq: 210, toneGain: 0.3, noiseGain: 0.5 },
    hihat: { hp: 8500, dur: 0.04, gain: 0.35 },
    clap: { bp: 1500, dur: 0.16, gain: 0.5 },
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

// Genereert een korte synthetische nagalm-respons (witte ruis met exponentieel verval) —
// geen sample nodig, werkt direct in elke browser.
function createImpulseResponse(c: AudioContext, duration = 1.8, decay = 2.4): AudioBuffer {
  const length = Math.max(1, Math.floor(c.sampleRate * duration));
  const impulse = c.createBuffer(2, length, c.sampleRate);
  for (let ch = 0; ch < impulse.numberOfChannels; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
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

    // Creative delay-bus: feedback-echo die los per geluid wordt "ingestuurd"
    const delayNode = ctx.createDelay(1.0);
    delayNode.delayTime.value = 0.27;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.38;
    const delayWet = ctx.createGain();
    delayWet.gain.value = 0.9;
    delayInput = ctx.createGain();
    delayInput.gain.value = 1;
    delayInput.connect(delayNode);
    delayNode.connect(feedback).connect(delayNode);
    delayNode.connect(delayWet).connect(master);

    // Reverb-bus: convolver met algoritmisch gegenereerde ruimte
    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulseResponse(ctx);
    const reverbWet = ctx.createGain();
    reverbWet.gain.value = 0.85;
    reverbInput = ctx.createGain();
    reverbInput.gain.value = 1;
    reverbInput.connect(convolver).connect(reverbWet).connect(master);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

// Stuurt een geluid (dry) naar de master en — als opgegeven — een deel ervan naar de
// delay- en/of reverb-bus. Zo is elk geluid in de beatmaker apart te kleuren.
function routeOut(node: AudioNode, fx?: DrumFx) {
  if (!ctx || !master) return;
  node.connect(master);
  if (fx?.delay && delayInput) {
    const send = ctx.createGain();
    send.gain.value = fx.delay;
    node.connect(send).connect(delayInput);
  }
  if (fx?.reverb && reverbInput) {
    const send = ctx.createGain();
    send.gain.value = fx.reverb;
    node.connect(send).connect(reverbInput);
  }
}

export function playDrum(type: DrumType, time?: number, kit: Kit = currentKit, fx?: DrumFx) {
  const c = getCtx();
  if (!c || !master) return;
  const now = time ?? c.currentTime;
  const p = kits[kit];

  if (type === "kick") {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.setValueAtTime(p.kick.f0, now);
    osc.frequency.exponentialRampToValueAtTime(p.kick.f1, now + p.kick.dur * 0.8);
    gain.gain.setValueAtTime(p.kick.gain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.kick.dur + 0.04);
    osc.connect(gain);
    routeOut(gain, fx);
    osc.start(now);
    osc.stop(now + p.kick.dur + 0.06);
    return;
  }

  if (type === "bongo") {
    // Pitched tom-achtige tik — los van de kit, want bongo's klinken overal hetzelfde
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(185, now + 0.09);
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    routeOut(gain, fx);
    osc.start(now);
    osc.stop(now + 0.16);
    return;
  }

  if (type === "conga") {
    // Lagere, langere open-conga-toon
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    routeOut(gain, fx);
    osc.start(now);
    osc.stop(now + 0.26);
    return;
  }

  if (type === "clave") {
    // Gepitchte houtklank — kort en droog
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.value = 2500;
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    routeOut(gain, fx);
    osc.start(now);
    osc.stop(now + 0.08);
    return;
  }

  if (type === "cowbell") {
    // Klassieke 808-stijl cowbell: twee vierkante golven in een metalen verhouding
    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();
    osc1.type = "square";
    osc2.type = "square";
    osc1.frequency.value = 587;
    osc2.frequency.value = 845;
    filter.type = "bandpass";
    filter.frequency.value = 2640;
    filter.Q.value = 1.2;
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    routeOut(gain, fx);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.32);
    osc2.stop(now + 0.32);
    return;
  }

  if (type === "guiro") {
    // Geschraap: een snelle reeks korte, hoge ruisstootjes
    const strokes = 4;
    for (let i = 0; i < strokes; i++) {
      const t = now + i * 0.028;
      const src = c.createBufferSource();
      src.buffer = noise;
      const filter = c.createBiquadFilter();
      const gain = c.createGain();
      filter.type = "bandpass";
      filter.frequency.value = 4200;
      filter.Q.value = 4;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      src.connect(filter).connect(gain);
      routeOut(gain, fx);
      src.start(t);
      src.stop(t + 0.03);
    }
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
    tone.connect(tg);
    routeOut(tg, fx);
    tone.start(now);
    tone.stop(now + p.snare.dur + 0.02);
  } else if (type === "rim") {
    // Korte, hoge klik — los van de kit
    filter.type = "bandpass";
    filter.frequency.value = 3200;
    filter.Q.value = 8;
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  } else {
    filter.type = "bandpass";
    filter.frequency.value = p.clap.bp;
    gain.gain.setValueAtTime(p.clap.gain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.clap.dur);
  }

  src.connect(filter).connect(gain);
  routeOut(gain, fx);
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
