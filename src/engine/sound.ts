/**
 * Offline Web Audio API synthesizer for UI sound effects AND a low-frequency
 * Viking-inspired ambient soundscape (tagelharpa fifth drone, fjord wind surf,
 * and sparse longhouse frame-drum / Kravik-lyre modal harmonics).
 * Zero external sound assets required.
 */

import { Season } from '../types/game';

let audioCtx: AudioContext | null = null;

interface AmbientEngineNodes {
  masterGain: GainNode;
  droneOscs: OscillatorNode[];
  lfoOscs: OscillatorNode[];
  windSource: AudioBufferSourceNode;
  windFilter: BiquadFilterNode;
  windGain: GainNode;
  pulseTimer: number | null;
}

let ambientNodes: AmbientEngineNodes | null = null;
let desiredAmbientActive = false;
let desiredAmbientVolume = 0.55;
let desiredAmbientSeason: Season = Season.Spring;

function getSeasonWindTarget(season: Season): { cutoff: number; gain: number } {
  switch (season) {
    case Season.Winter:
      return { cutoff: 320, gain: 0.3 }; // Howling Nordic blizzard wind
    case Season.Autumn:
      return { cutoff: 230, gain: 0.26 }; // North Sea autumn squalls & surf
    case Season.Summer:
      return { cutoff: 120, gain: 0.18 }; // Calm summer sea swell
    case Season.Spring:
    default:
      return { cutoff: 165, gain: 0.22 }; // Coastal thaw breeze
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (Ctor) {
      audioCtx = new Ctor();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function createBrownianWindBuffer(ctx: AudioContext): AudioBuffer {
  const durationSec = 5;
  const length = ctx.sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    // Crossfade loop ends smoothly to avoid clicks
    const edgeFade =
      i < 2400 ? i / 2400 : i > length - 2400 ? (length - i) / 2400 : 1;
    data[i] = lastOut * 2.6 * edgeFade;
  }
  return buffer;
}

function triggerSparseNordicPulse(): void {
  if (!ambientNodes || !audioCtx || audioCtx.state !== 'running' || !desiredAmbientActive) {
    return;
  }

  try {
    const now = audioCtx.currentTime;
    const roll = Math.random();

    if (roll < 0.55) {
      // Deep, muffled shamanic / longhouse hearth frame-drum heartbeat
      const drumOsc = audioCtx.createOscillator();
      const drumGain = audioCtx.createGain();
      const drumFilter = audioCtx.createBiquadFilter();

      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(62, now);
      drumOsc.frequency.exponentialRampToValueAtTime(34, now + 0.45);

      drumFilter.type = 'lowpass';
      drumFilter.frequency.setValueAtTime(120, now);

      drumGain.gain.setValueAtTime(0.0001, now);
      drumGain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      drumOsc.connect(drumFilter);
      drumFilter.connect(drumGain);
      drumGain.connect(ambientNodes.masterGain);

      drumOsc.start(now);
      drumOsc.stop(now + 0.7);
    } else {
      // Distant D-Dorian Kravik-lyre / overtone harmonic (D3, F3, G3, A3, C4)
      const dorianNotes = [146.83, 174.61, 196.0, 220.0, 261.63];
      const freq = dorianNotes[Math.floor(Math.random() * dorianNotes.length)];

      const noteOsc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      const noteFilter = audioCtx.createBiquadFilter();

      noteOsc.type = 'triangle';
      noteOsc.frequency.setValueAtTime(freq, now);

      noteFilter.type = 'lowpass';
      noteFilter.frequency.setValueAtTime(420, now);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.075, now + 0.12);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

      noteOsc.connect(noteFilter);
      noteFilter.connect(noteGain);
      noteGain.connect(ambientNodes.masterGain);

      noteOsc.start(now);
      noteOsc.stop(now + 3.5);
    }
  } catch {
    // Ignore transient Web Audio errors
  }
}

function targetMasterGainValue(volume: number): number {
  const clamped = Math.max(0.05, Math.min(1, volume));
  // Keep maximum ambient level gentle and non-intrusive beneath gameplay SFX
  return clamped * 0.16;
}

export function syncAmbientSoundscape(
  active: boolean,
  volume = 0.55,
  season: Season = desiredAmbientSeason
): void {
  desiredAmbientActive = active;
  desiredAmbientVolume = volume;
  desiredAmbientSeason = season;

  if (!active) {
    stopAmbientSoundscape();
    return;
  }

  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const targetGain = targetMasterGainValue(volume);
  const windTarget = getSeasonWindTarget(season);

  if (ambientNodes) {
    try {
      ambientNodes.masterGain.gain.cancelScheduledValues(now);
      ambientNodes.masterGain.gain.setValueAtTime(
        Math.max(0.0001, ambientNodes.masterGain.gain.value),
        now
      );
      ambientNodes.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.35);

      ambientNodes.windFilter.frequency.cancelScheduledValues(now);
      ambientNodes.windFilter.frequency.setValueAtTime(
        ambientNodes.windFilter.frequency.value,
        now
      );
      ambientNodes.windFilter.frequency.linearRampToValueAtTime(windTarget.cutoff, now + 1.2);

      ambientNodes.windGain.gain.cancelScheduledValues(now);
      ambientNodes.windGain.gain.setValueAtTime(ambientNodes.windGain.gain.value, now);
      ambientNodes.windGain.gain.linearRampToValueAtTime(windTarget.gain, now + 1.2);
    } catch {
      // Ignore
    }
    return;
  }

  try {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(targetGain, now + 1.8);
    masterGain.connect(ctx.destination);

    // 1. Low-Frequency Bowed Tagelharpa Drone (D1 36.71Hz, A1 55.0Hz, D2 73.42Hz)
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(185, now);
    droneFilter.Q.setValueAtTime(1.1, now);
    droneFilter.connect(masterGain);

    // Slow breathing LFO modulating the drone filter cutoff (16.6s period)
    const filterLfo = ctx.createOscillator();
    const filterLfoGain = ctx.createGain();
    filterLfo.type = 'sine';
    filterLfo.frequency.setValueAtTime(0.06, now);
    filterLfoGain.gain.setValueAtTime(55, now);
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(droneFilter.frequency);
    filterLfo.start(now);

    const droneConfigs: { freq: number; type: OscillatorType; detune: number; gain: number }[] = [
      { freq: 36.71, type: 'sine', detune: 0, gain: 0.48 }, // Sub-bass D1 root
      { freq: 55.0, type: 'triangle', detune: -4, gain: 0.24 }, // Open fifth A1
      { freq: 73.42, type: 'sawtooth', detune: 3, gain: 0.14 }, // Bowed D2 warmth
      { freq: 73.42, type: 'triangle', detune: -5, gain: 0.14 }, // Chorus D2 double
    ];

    const droneOscs: OscillatorNode[] = [];
    for (const cfg of droneConfigs) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = cfg.type;
      osc.frequency.setValueAtTime(cfg.freq, now);
      osc.detune.setValueAtTime(cfg.detune, now);
      g.gain.setValueAtTime(cfg.gain, now);
      osc.connect(g);
      g.connect(droneFilter);
      osc.start(now);
      droneOscs.push(osc);
    }

    // 2. Low-Frequency Nordic Fjord Wind & Distant Sea Swell
    const windBuffer = createBrownianWindBuffer(ctx);
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(windTarget.cutoff, now);
    windFilter.Q.setValueAtTime(0.7, now);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(windTarget.gain, now);

    // Slow ocean swell LFO (11s cycle)
    const windLfo = ctx.createOscillator();
    const windLfoGain = ctx.createGain();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(0.09, now);
    windLfoGain.gain.setValueAtTime(0.09, now);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windGain.gain);
    windLfo.start(now);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windSource.start(now);

    const pulseTimer = window.setInterval(() => {
      triggerSparseNordicPulse();
    }, 7500);

    ambientNodes = {
      masterGain,
      droneOscs,
      lfoOscs: [filterLfo, windLfo],
      windSource,
      windFilter,
      windGain,
      pulseTimer,
    };
  } catch {
    // Ignore audio initialization restrictions
  }
}

export function stopAmbientSoundscape(): void {
  desiredAmbientActive = false;
  if (!ambientNodes) return;

  const nodesToClean = ambientNodes;
  ambientNodes = null;

  if (nodesToClean.pulseTimer !== null) {
    window.clearInterval(nodesToClean.pulseTimer);
  }

  try {
    if (audioCtx) {
      const now = audioCtx.currentTime;
      nodesToClean.masterGain.gain.cancelScheduledValues(now);
      nodesToClean.masterGain.gain.setValueAtTime(
        Math.max(0.0001, nodesToClean.masterGain.gain.value),
        now
      );
      nodesToClean.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      window.setTimeout(() => {
        nodesToClean.droneOscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // Ignore
          }
        });
        nodesToClean.lfoOscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // Ignore
          }
        });
        try {
          nodesToClean.windSource.stop();
          nodesToClean.windSource.disconnect();
          nodesToClean.masterGain.disconnect();
        } catch {
          // Ignore
        }
      }, 500);
    }
  } catch {
    // Ignore cleanup errors
  }
}

export function resumeAudioIfNeeded(): void {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (desiredAmbientActive && !ambientNodes) {
    syncAmbientSoundscape(true, desiredAmbientVolume, desiredAmbientSeason);
  }
}

export function playSound(
  type: 'advance' | 'choice' | 'click' | 'raid' | 'honor' | 'dishonor' | 'death' | 'sail',
  enabled: boolean
): void {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    if (type === 'advance') {
      // Warm low frame-drum thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.14);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'choice' || type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'raid') {
      // Deep Norse lur horn fifth
      [130.81, 196.0].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + 0.45);
      });
    } else if (type === 'honor') {
      // Plucked lyre chord
      [293.66, 440.0].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.09, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + 0.38);
      });
    } else if (type === 'dishonor') {
      // Muted descending D-minor pluck for stained honor
      [220.0, 164.81].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.075, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + 0.4);
      });
    } else if (type === 'sail') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(196, now);
      osc.frequency.linearRampToValueAtTime(246.94, now + 0.22);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'death') {
      // Solemn low minor drone
      [98.0, 116.54].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.78);
      });
    }
  } catch {
    // Ignore audio errors on restricted devices
  }
}
