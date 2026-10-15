import { fakeAsync, tick } from '@angular/core/testing';
import { PageTurnSoundService } from './page-turn-sound.service';

class FakeParam {
  value = 0;
  readonly scheduled: number[] = [];
  setValueAtTime(v: number): void { this.value = v; this.scheduled.push(v); }
  linearRampToValueAtTime(v: number): void { this.scheduled.push(v); }
  exponentialRampToValueAtTime(v: number): void { this.scheduled.push(v); }
  cancelScheduledValues(): void { /* no-op */ }
}

class FakeNode {
  readonly connections: unknown[] = [];
  connect(target: unknown): void { this.connections.push(target); }
}

class FakeGain extends FakeNode { gain = new FakeParam(); }

class FakeFilter extends FakeNode {
  type = '';
  frequency = new FakeParam();
  Q = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  started = false;
  start(): void { this.started = true; }
  stop(): void { /* no-op */ }
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  static initialState: AudioContextState = 'running';
  static resumeResult: () => PromiseLike<void> = () => Promise.resolve();
  static closeResult: () => PromiseLike<void> = () => Promise.resolve();

  state: AudioContextState = FakeAudioContext.initialState;
  currentTime = 0;
  sampleRate = 8000;
  destination = {};
  gains: FakeGain[] = [];
  sources: FakeSource[] = [];
  resumeCalls = 0;
  closeCalls = 0;

  constructor() { FakeAudioContext.instances.push(this); }
  createGain(): FakeGain { const g = new FakeGain(); this.gains.push(g); return g; }
  createBiquadFilter(): FakeFilter { return new FakeFilter(); }
  createBufferSource(): FakeSource { const s = new FakeSource(); this.sources.push(s); return s; }
  createBuffer(_channels: number, length: number): { getChannelData: () => Float32Array } {
    const data = new Float32Array(length);
    return { getChannelData: () => data };
  }
  resume(): PromiseLike<void> { this.resumeCalls++; return FakeAudioContext.resumeResult(); }
  close(): PromiseLike<void> { this.closeCalls++; return FakeAudioContext.closeResult(); }
}

/** Rejected thenable that records whether someone attached a rejection handler. */
class TrackedRejection implements PromiseLike<void> {
  static created: TrackedRejection[] = [];
  handled = false;
  constructor() { TrackedRejection.created.push(this); }
  then<A = void, B = never>(
    _onFulfilled?: ((value: void) => A | PromiseLike<A>) | null,
    onRejected?: ((reason: unknown) => B | PromiseLike<B>) | null
  ): PromiseLike<A | B> {
    if (typeof onRejected === 'function') {
      this.handled = true;
      onRejected(new Error('rejected'));
    }
    return this as unknown as PromiseLike<A | B>;
  }
  catch(onRejected: (reason: unknown) => void): this {
    this.handled = true;
    onRejected(new Error('rejected'));
    return this;
  }
}

type AudioWindow = { AudioContext?: unknown; webkitAudioContext?: unknown };

describe('PageTurnSoundService', () => {
  const w = window as unknown as AudioWindow;
  let originalAudio: unknown;
  let originalWebkit: unknown;
  let unhandled: PromiseRejectionEvent[];
  const onUnhandled = (e: PromiseRejectionEvent) => { unhandled.push(e); e.preventDefault(); };

  function setAudio(ctor: unknown, webkit: unknown = undefined): void {
    w.AudioContext = ctor;
    w.webkitAudioContext = webkit;
  }

  /** Lets pending microtasks and a macrotask run so unhandled rejections fire. */
  async function flush(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  beforeEach(() => {
    originalAudio = w.AudioContext;
    originalWebkit = w.webkitAudioContext;
    FakeAudioContext.instances = [];
    FakeAudioContext.initialState = 'running';
    FakeAudioContext.resumeResult = () => Promise.resolve();
    FakeAudioContext.closeResult = () => Promise.resolve();
    unhandled = [];
    TrackedRejection.created = [];
    window.addEventListener('unhandledrejection', onUnhandled);
  });

  afterEach(() => {
    window.removeEventListener('unhandledrejection', onUnhandled);
    w.AudioContext = originalAudio;
    w.webkitAudioContext = originalWebkit;
  });

  it('sin AudioContext ni webkitAudioContext, play() y stop() no lanzan', () => {
    setAudio(undefined, undefined);
    const service = new PageTurnSoundService();
    expect(() => service.play()).not.toThrow();
    expect(() => service.stop()).not.toThrow();
  });

  it('usa webkitAudioContext cuando AudioContext no existe', () => {
    setAudio(undefined, FakeAudioContext);
    new PageTurnSoundService().play();
    expect(FakeAudioContext.instances.length).toBe(1);
  });

  it('con un constructor que lanza, play() y stop() no lanzan', () => {
    setAudio(function ThrowingContext() { throw new Error('NotAllowedError'); });
    const service = new PageTurnSoundService();
    expect(() => service.play()).not.toThrow();
    expect(() => service.stop()).not.toThrow();
  });

  it('si la construccion del grafo falla, cierra el contexto sin lanzar', () => {
    class BrokenContext extends FakeAudioContext {
      override createBiquadFilter(): FakeFilter { throw new Error('boom'); }
    }
    setAudio(BrokenContext);
    const service = new PageTurnSoundService();
    expect(() => service.play()).not.toThrow();
    expect(FakeAudioContext.instances[0].closeCalls).toBe(1);
  });

  it('con resume() rechazado no deja promesas rechazadas sin capturar', async () => {
    FakeAudioContext.initialState = 'suspended';
    FakeAudioContext.resumeResult = () => new TrackedRejection();
    setAudio(FakeAudioContext);
    const service = new PageTurnSoundService();

    expect(() => service.play()).not.toThrow();
    expect(FakeAudioContext.instances[0].resumeCalls).toBe(1);
    expect(TrackedRejection.created.length).toBe(1);
    expect(TrackedRejection.created[0].handled).toBeTrue();
    await flush();
    expect(unhandled.length).toBe(0);
  });

  it('con close() rechazado al detener no deja promesas rechazadas sin capturar', async () => {
    FakeAudioContext.closeResult = () => new TrackedRejection();
    setAudio(FakeAudioContext);
    const service = new PageTurnSoundService();
    service.play();
    service.stop();
    await new Promise((resolve) => setTimeout(resolve, 150));
    await flush();
    expect(FakeAudioContext.instances[0].closeCalls).toBe(1);
    expect(TrackedRejection.created[0].handled).toBeTrue();
    expect(unhandled.length).toBe(0);
  });

  it('stop() sin play() previo no lanza', () => {
    setAudio(FakeAudioContext);
    expect(() => new PageTurnSoundService().stop()).not.toThrow();
    expect(FakeAudioContext.instances.length).toBe(0);
  });

  it('play() arranca las fuentes con ganancias de pico <= 0.3', () => {
    setAudio(FakeAudioContext);
    new PageTurnSoundService().play();
    const ctx = FakeAudioContext.instances[0];
    expect(ctx.sources.length).toBe(2);
    expect(ctx.sources.every((s) => s.started)).toBeTrue();
    const envelopes = ctx.gains.slice(1);
    const peak = Math.max(...envelopes.flatMap((g) => g.gain.scheduled));
    expect(peak).toBeGreaterThan(0);
    expect(peak).toBeLessThanOrEqual(0.3);
  });

  it('no se repite: un segundo play() no crea otro contexto', () => {
    setAudio(FakeAudioContext);
    const service = new PageTurnSoundService();
    service.play();
    service.play();
    expect(FakeAudioContext.instances.length).toBe(1);
  });

  it('stop() lleva la ganancia a 0 y cierra el contexto tras la rampa', fakeAsync(() => {
    setAudio(FakeAudioContext);
    const service = new PageTurnSoundService();
    service.play();
    const ctx = FakeAudioContext.instances[0];
    service.stop();
    const master = ctx.gains[0];
    expect(master.gain.scheduled[master.gain.scheduled.length - 1]).toBe(0);
    expect(ctx.closeCalls).toBe(0);
    tick(100);
    expect(ctx.closeCalls).toBe(1);
  }));

  it('cierra el contexto cuando el sonido termina solo', () => {
    setAudio(FakeAudioContext);
    new PageTurnSoundService().play();
    const ctx = FakeAudioContext.instances[0];
    ctx.sources[1].onended?.();
    expect(ctx.closeCalls).toBe(1);
  });
});
