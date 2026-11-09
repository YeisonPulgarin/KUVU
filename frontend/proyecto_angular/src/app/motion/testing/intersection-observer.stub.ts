/**
 * Test double for `IntersectionObserver`: records the observed elements and lets a spec
 * report them as entering or leaving the viewport. `install()` replaces the global and
 * `restore()` puts the original back.
 */
export class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = [];
  private static original?: typeof IntersectionObserver;

  readonly observed = new Set<Element>();
  disconnected = false;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit
  ) {
    IntersectionObserverStub.instances.push(this);
  }

  static install(): void {
    IntersectionObserverStub.instances = [];
    IntersectionObserverStub.original = window.IntersectionObserver;
    window.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
  }

  static restore(): void {
    if (IntersectionObserverStub.original) {
      window.IntersectionObserver = IntersectionObserverStub.original;
    }
    IntersectionObserverStub.instances = [];
  }

  observe(element: Element): void {
    this.observed.add(element);
  }

  unobserve(element: Element): void {
    this.observed.delete(element);
  }

  disconnect(): void {
    this.observed.clear();
    this.disconnected = true;
  }

  /** Reports `element` as intersecting (or not) to the callback. */
  trigger(element: Element, isIntersecting: boolean): void {
    const entry = { target: element, isIntersecting } as unknown as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }
}
