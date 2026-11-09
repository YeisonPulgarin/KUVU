import { DOCUMENT, Injectable, NgZone, OnDestroy, inject } from '@angular/core';

/**
 * Which part of an element's trip through the viewport maps to progress 0 → 1:
 * - `cover`: from its top edge touching the bottom of the viewport to its bottom edge
 *   passing the top (the whole crossing).
 * - `contain`: from its top edge at the top of the viewport to its bottom edge at the bottom
 *   (a tall section with a sticky inner box).
 * - `exit`: from its top edge at the top of the viewport to its bottom edge passing the top
 *   (a hero that starts on screen and leaves).
 */
export type ScrollRange = 'cover' | 'contain' | 'exit';

export interface ScrollTarget {
  readonly element: HTMLElement;
  readonly range?: ScrollRange;
  /** Receives the progress (0–1) once per frame while the element is in view. */
  write(progress: number): void;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Progress (0–1) of an element with the given rect for a viewport of `viewportHeight` px. */
export function scrollProgress(
  rect: Pick<DOMRect, 'top' | 'height'>,
  viewportHeight: number,
  range: ScrollRange = 'cover'
): number {
  const [anchor, length] =
    range === 'exit'
      ? [0, rect.height]
      : range === 'contain'
        ? [0, rect.height - viewportHeight]
        : [viewportHeight, viewportHeight + rect.height];
  if (length <= 0) {
    return rect.top <= anchor ? 1 : 0;
  }
  return clamp01((anchor - rect.top) / length);
}

/**
 * Single scroll loop for scroll-linked motion. One passive `scroll` and one passive `resize`
 * listener mark the loop dirty; one requestAnimationFrame per burst reads every visible
 * target's rect first and writes every progress after, so there is no layout thrashing.
 * An IntersectionObserver keeps only targets near the viewport active.
 *
 * Not `providedIn: 'root'`: the component that uses it provides it, so leaving that component
 * destroys the service and releases listeners, observer and pending frame.
 */
@Injectable()
export class ScrollMotionService implements OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly win = inject(DOCUMENT).defaultView as Window;

  private readonly targets = new Map<Element, ScrollTarget>();
  private readonly active = new Set<ScrollTarget>();
  private observer?: IntersectionObserver;
  private pageHost: HTMLElement | null = null;
  private frame = 0;
  private listening = false;

  private readonly onScroll = () => this.schedule();

  private readonly onIntersect: IntersectionObserverCallback = (entries) => {
    for (const entry of entries) {
      const target = this.targets.get(entry.target);
      if (!target) continue;
      if (entry.isIntersecting) {
        this.active.add(target);
      } else {
        this.active.delete(target);
      }
    }
    this.schedule();
  };

  /** Starts tracking a target. Returns the function that stops tracking it. */
  register(target: ScrollTarget): () => void {
    this.unregister(this.targets.get(target.element));
    this.targets.set(target.element, target);
    this.start();
    if (this.observer) {
      this.observer.observe(target.element);
    } else {
      this.active.add(target);
      this.schedule();
    }
    return () => this.unregister(target);
  }

  /** Publishes `--page-progress` (0 at the top of the page, 1 at the end) on `element`. */
  setPageProgressHost(element: HTMLElement | null): void {
    this.pageHost = element;
    if (element) {
      this.start();
      this.schedule();
    }
  }

  ngOnDestroy(): void {
    if (this.listening) {
      this.win.removeEventListener('scroll', this.onScroll);
      this.win.removeEventListener('resize', this.onScroll);
    }
    this.observer?.disconnect();
    this.observer = undefined;
    if (this.frame) {
      this.win.cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
    this.targets.clear();
    this.active.clear();
    this.pageHost = null;
    this.listening = false;
  }

  private unregister(target: ScrollTarget | undefined): void {
    if (!target || this.targets.get(target.element) !== target) return;
    this.targets.delete(target.element);
    this.active.delete(target);
    this.observer?.unobserve(target.element);
  }

  private start(): void {
    if (this.listening) return;
    this.listening = true;
    this.zone.runOutsideAngular(() => {
      this.win.addEventListener('scroll', this.onScroll, { passive: true });
      this.win.addEventListener('resize', this.onScroll, { passive: true });
      if (typeof IntersectionObserver === 'function') {
        this.observer = new IntersectionObserver(this.onIntersect, {
          rootMargin: '10% 0px'
        });
      }
    });
  }

  private schedule(): void {
    if (this.frame || !this.listening) return;
    this.zone.runOutsideAngular(() => {
      this.frame = this.win.requestAnimationFrame(() => this.update());
    });
  }

  private update(): void {
    this.frame = 0;
    const viewportHeight = this.win.innerHeight;

    // Reads first…
    const measured = Array.from(this.active, (target) => ({
      target,
      rect: target.element.getBoundingClientRect()
    }));
    let pageProgress = 0;
    if (this.pageHost) {
      const scrollable = this.win.document.documentElement.scrollHeight - viewportHeight;
      pageProgress = scrollable > 0 ? clamp01(this.win.scrollY / scrollable) : 0;
    }

    // …writes after.
    for (const { target, rect } of measured) {
      target.write(scrollProgress(rect, viewportHeight, target.range));
    }
    this.pageHost?.style.setProperty('--page-progress', pageProgress.toFixed(4));
  }
}
