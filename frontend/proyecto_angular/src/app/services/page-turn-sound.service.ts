import { Injectable } from '@angular/core';

type AudioContextCtor = new () => AudioContext;

/** Length of the effect, in seconds (R6.1: at most 1.5 s). */
export const SOUND_SECONDS = 1.4;
/** Ceiling of the output signal, as a sample peak (R6.1: at most 0.3). */
export const OUTPUT_CEILING = 0.3;
/** Output gain applied before the limiter: +10 dB. */
const OUTPUT_GAIN = 3.16;
const RUSTLE_PEAK = 0.18;
const RUSTLE_END = 1.3;
const THUMP_PEAK = 0.25;
const THUMP_START = 1.32;
const THUMP_SECONDS = 0.04;
const STOP_RAMP_SECONDS = 0.06;
const LIMITER_POINTS = 1024;

/** Swallows a possible promise rejection so it never surfaces as unhandled. */
function ignoreRejection(result: unknown): void {
  const thenable = result as PromiseLike<unknown> | undefined;
  if (thenable && typeof thenable.then === 'function') {
    thenable.then(undefined, () => undefined);
  }
}

function resolveAudioContext(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/** True unless the browser reports that the page never had a user gesture. */
function hasUserActivation(): boolean {
  if (typeof navigator === 'undefined') return true;
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return activation ? activation.hasBeenActive : true;
}

/** Soft limiter curve: ceiling * tanh(x / ceiling), so |output| never exceeds the ceiling. */
function limiterCurve(): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(LIMITER_POINTS);
  for (let i = 0; i < LIMITER_POINTS; i++) {
    const x = (i / (LIMITER_POINTS - 1)) * 2 - 1;
    curve[i] = OUTPUT_CEILING * Math.tanh(x / OUTPUT_CEILING);
  }
  return curve;
}

/**
 * Builds the "page turn" effect on any audio context (live or offline) and
 * connects it to `destination`. Returns the last source to end, so callers
 * can release the context when the effect finishes on its own.
 */
export function buildPageTurnGraph(ctx: BaseAudioContext, destination: AudioNode): AudioBufferSourceNode {
  const t = ctx.currentTime;
  const noise = createNoiseBuffer(ctx);

  // Output stage: +10 dB, then a soft limiter that caps the sample peak.
  const output = ctx.createGain();
  output.gain.value = OUTPUT_GAIN;
  const limiter = ctx.createWaveShaper();
  limiter.curve = limiterCurve();
  output.connect(limiter);
  limiter.connect(destination);

  // Rustle: white noise -> highpass -> sweeping bandpass -> envelope.
  const rustle = ctx.createBufferSource();
  rustle.buffer = noise;
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 400;
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.Q.value = 0.9;
  bandpass.frequency.setValueAtTime(900, t);
  bandpass.frequency.exponentialRampToValueAtTime(2600, t + 1.15);
  const rustleEnv = ctx.createGain();
  rustleEnv.gain.setValueAtTime(0, t);
  rustleEnv.gain.linearRampToValueAtTime(RUSTLE_PEAK, t + 0.08);
  rustleEnv.gain.linearRampToValueAtTime(0.1, t + 0.45);
  rustleEnv.gain.linearRampToValueAtTime(0.15, t + 0.75);
  rustleEnv.gain.linearRampToValueAtTime(0.07, t + 1.05);
  rustleEnv.gain.linearRampToValueAtTime(0, t + RUSTLE_END);
  rustle.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(rustleEnv);
  rustleEnv.connect(output);

  // Thump: short low-passed burst when the sheet settles.
  const thump = ctx.createBufferSource();
  thump.buffer = noise;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 600;
  const thumpEnv = ctx.createGain();
  thumpEnv.gain.setValueAtTime(0, t + THUMP_START);
  thumpEnv.gain.linearRampToValueAtTime(THUMP_PEAK, t + THUMP_START + 0.008);
  thumpEnv.gain.linearRampToValueAtTime(0, t + THUMP_START + THUMP_SECONDS);
  thump.connect(lowpass);
  lowpass.connect(thumpEnv);
  thumpEnv.connect(output);

  rustle.start(t);
  rustle.stop(t + SOUND_SECONDS);
  thump.start(t + THUMP_START);
  thump.stop(t + THUMP_START + THUMP_SECONDS + 0.01);
  return thump;
}

function createNoiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * SOUND_SECONDS));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/**
 * Synthesized "page turn" sound effect (Web Audio, no assets).
 * Fails silently: a missing API, a throwing constructor or a rejected
 * resume() never throws nor leaves an unhandled rejection.
 */
@Injectable({ providedIn: 'root' })
export class PageTurnSoundService {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;

  play(): void {
    if (this.context) return;
    // Without a prior user gesture the browser keeps any new context suspended:
    // skip creating one, the intro runs silent either way (R6.2).
    if (!hasUserActivation()) return;
    try {
      const Ctor = resolveAudioContext();
      if (!Ctor) return;
      const ctx = new Ctor();
      this.context = ctx;
      if (ctx.state === 'suspended') ignoreRejection(ctx.resume());

      const master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      this.master = master;

      const last = buildPageTurnGraph(ctx, master);
      last.onended = () => {
        if (this.context === ctx) {
          this.context = null;
          this.master = null;
          this.closeContext(ctx);
        }
      };
    } catch {
      this.close();
    }
  }

  stop(): void {
    const ctx = this.context;
    if (!ctx) return;
    try {
      const gain = this.master?.gain;
      if (gain) {
        const now = ctx.currentTime;
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(gain.value, now);
        gain.linearRampToValueAtTime(0, now + STOP_RAMP_SECONDS);
      }
    } catch {
      // Ramp is best effort; the context is closed below anyway.
    }
    this.context = null;
    this.master = null;
    setTimeout(() => this.closeContext(ctx), STOP_RAMP_SECONDS * 1000 + 20);
  }

  private close(): void {
    const ctx = this.context;
    this.context = null;
    this.master = null;
    if (ctx) this.closeContext(ctx);
  }

  private closeContext(ctx: AudioContext): void {
    try {
      ignoreRejection(ctx.close());
    } catch {
      // Already closed or unsupported: nothing to release.
    }
  }
}
