/**
 * Test double for `requestAnimationFrame`: callbacks queue up until `flush()`, so a spec can
 * count how many frames were requested and decide when they run.
 */
export class AnimationFrameStub {
  readonly request: jasmine.Spy;
  readonly cancel: jasmine.Spy;
  private queue = new Map<number, FrameRequestCallback>();
  private nextId = 1;

  constructor() {
    this.request = spyOn(window, 'requestAnimationFrame').and.callFake((callback) => {
      const id = this.nextId++;
      this.queue.set(id, callback);
      return id;
    });
    this.cancel = spyOn(window, 'cancelAnimationFrame').and.callFake((id: number) => {
      this.queue.delete(id);
    });
  }

  get pending(): number {
    return this.queue.size;
  }

  /** Runs every queued frame once. */
  flush(): void {
    const frames = Array.from(this.queue.values());
    this.queue.clear();
    frames.forEach((callback) => callback(performance.now()));
  }
}
