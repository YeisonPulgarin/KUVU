import { MOTION_QUERIES, MotionQuery } from '../motion-preferences';

type Listener = (event: MediaQueryListEvent) => void;

/**
 * Test double for `window.matchMedia`: each query answers a configurable `matches` and
 * `set()` dispatches `change` to its listeners. `install()` replaces the global and
 * `restore()` puts the original back.
 */
export class MatchMediaStub {
  private readonly state = new Map<string, boolean>();
  private readonly listeners = new Map<string, Set<Listener>>();
  private original?: typeof window.matchMedia;

  constructor(initial: Partial<Record<MotionQuery, boolean>> = {}) {
    for (const [name, matches] of Object.entries(initial)) {
      this.state.set(MOTION_QUERIES[name as MotionQuery], matches as boolean);
    }
  }

  install(): this {
    this.original = window.matchMedia;
    window.matchMedia = ((query: string) => this.list(query)) as typeof window.matchMedia;
    return this;
  }

  restore(): void {
    if (this.original) {
      window.matchMedia = this.original;
    }
  }

  /** Changes a query and notifies its listeners, like a real `change` event. */
  set(name: MotionQuery, matches: boolean): void {
    const query = MOTION_QUERIES[name];
    this.state.set(query, matches);
    const event = { matches, media: query } as MediaQueryListEvent;
    this.listeners.get(query)?.forEach((listener) => listener(event));
  }

  /** Number of `change` listeners currently registered for a query. */
  listenerCount(name: MotionQuery): number {
    return this.listeners.get(MOTION_QUERIES[name])?.size ?? 0;
  }

  private list(query: string): MediaQueryList {
    const stub = this;
    const listeners = this.listeners.get(query) ?? new Set<Listener>();
    this.listeners.set(query, listeners);
    return {
      get matches() {
        return stub.state.get(query) ?? false;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
      removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
      addListener: (listener: Listener) => listeners.add(listener),
      removeListener: (listener: Listener) => listeners.delete(listener),
      dispatchEvent: () => false
    } as unknown as MediaQueryList;
  }
}
