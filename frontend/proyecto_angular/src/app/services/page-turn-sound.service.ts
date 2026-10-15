import { Injectable } from '@angular/core';

type AudioContextCtor = new () => AudioContext;

const NOISE_SECONDS = 0.9;
const RUSTLE_PEAK = 0.18;
const THUMP_PEAK = 0.25;
const THUMP_START = 0.86;
const THUMP_SECONDS = 0.04;
const STOP_RAMP_SECONDS = 0.06;

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
    try {
      const Ctor = resolveAudioContext();
      if (!Ctor) return;
      const ctx = new Ctor();
      this.context = ctx;
      if (ctx.state === 'suspended') ignoreRejection(ctx.resume());
      this.buildGraph(ctx);
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

  private buildGraph(ctx: AudioContext): void {
    const t = ctx.currentTime;
    const noise = this.createNoiseBuffer(ctx);

    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    this.master = master;

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
    bandpass.frequency.exponentialRampToValueAtTime(2600, t + 0.75);
    const rustleEnv = ctx.createGain();
    rustleEnv.gain.setValueAtTime(0, t);
    rustleEnv.gain.linearRampToValueAtTime(RUSTLE_PEAK, t + 0.06);
    rustleEnv.gain.linearRampToValueAtTime(0.1, t + 0.3);
    rustleEnv.gain.linearRampToValueAtTime(0.15, t + 0.5);
    rustleEnv.gain.linearRampToValueAtTime(0.07, t + 0.7);
    rustleEnv.gain.linearRampToValueAtTime(0, t + 0.85);
    rustle.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(rustleEnv);
    rustleEnv.connect(master);

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
    thumpEnv.connect(master);

    thump.onended = () => {
      if (this.context === ctx) {
        this.context = null;
        this.master = null;
        this.closeContext(ctx);
      }
    };

    rustle.start(t);
    rustle.stop(t + NOISE_SECONDS);
    thump.start(t + THUMP_START);
    thump.stop(t + THUMP_START + THUMP_SECONDS + 0.01);
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.max(1, Math.floor(ctx.sampleRate * NOISE_SECONDS));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
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
