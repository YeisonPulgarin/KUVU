import { DOCUMENT, Injectable, NgZone, computed, inject, signal } from '@angular/core';
import { sitePages } from '../../../content/site';
import type { HomeSpySection } from '../../../content/site';
import type { NavItem } from '../../../content/types';
import { headerScrollOffset } from '../../../scroll-offset';

/** Share of the viewport height where the reading line sits (below the header and trail). */
export const SPY_LINE_RATIO = 0.35;

/** One step of the scroll trail: a menu item plus the home section it jumps to. */
export interface TrailItem extends NavItem {
  readonly fragment: string;
}

/**
 * Index of the active section: the last one whose top edge has crossed `line` (px from the
 * top of the viewport). At the bottom of the page the last section wins, because a short
 * closing band never reaches the line. Before the first section it is still the first one.
 */
export function activeSectionIndex(tops: readonly number[], line: number, atBottom: boolean): number {
  if (tops.length === 0) {
    return -1;
  }
  if (atBottom) {
    return tops.length - 1;
  }
  let index = 0;
  tops.forEach((top, i) => {
    if (top <= line) {
      index = i;
    }
  });
  return index;
}

/**
 * Which home section the visitor is reading. The home feeds it while it lives (`start` /
 * `stop`) and the site header reads it to highlight the menu item and draw the trail. Off the
 * home it stays stopped, so the header falls back to the route.
 *
 * Root-provided because producer (home) and consumer (header) share no other injector. One
 * passive `scroll` and one `resize` listener, outside Angular's zone, coalesce into a single
 * requestAnimationFrame; the zone is re-entered only when the active index changes.
 */
@Injectable({ providedIn: 'root' })
export class SectionSpyService {
  private readonly zone = inject(NgZone);
  private readonly doc = inject(DOCUMENT);

  private readonly sections = signal<readonly HomeSpySection[]>([]);
  private readonly index = signal(-1);
  private frame = 0;
  private detach: (() => void) | null = null;

  /** `href` of the menu item of the active section, or `null` while stopped. */
  readonly activeHref = computed(() => this.sections()[this.index()]?.href ?? null);

  /** Menu items from the first one up to the active section, each pointing to its section. */
  readonly trail = computed<readonly TrailItem[]>(() =>
    this.sections()
      .slice(0, this.index() + 1)
      .map((section) => ({
        label: sitePages.find((page) => page.href === section.href)?.label ?? section.href,
        href: section.href,
        fragment: section.id
      }))
  );

  start(sections: readonly HomeSpySection[]): void {
    this.stop();
    const win = this.doc.defaultView;
    if (!win) {
      return;
    }
    this.sections.set(sections);
    const schedule = () => {
      if (this.frame === 0) {
        this.frame = win.requestAnimationFrame(() => {
          this.frame = 0;
          this.update();
        });
      }
    };
    this.zone.runOutsideAngular(() => {
      win.addEventListener('scroll', schedule, { passive: true });
      win.addEventListener('resize', schedule, { passive: true });
    });
    this.detach = () => {
      win.removeEventListener('scroll', schedule);
      win.removeEventListener('resize', schedule);
      if (this.frame !== 0) {
        win.cancelAnimationFrame(this.frame);
        this.frame = 0;
      }
    };
    this.update();
  }

  stop(): void {
    this.detach?.();
    this.detach = null;
    this.sections.set([]);
    this.index.set(-1);
  }

  /** Reads every section top once and publishes the index if it changed. */
  private update(): void {
    const win = this.doc.defaultView;
    if (!win) {
      return;
    }
    const tops = this.sections().map(
      (section) => this.doc.getElementById(section.id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
    );
    const line = Math.max(headerScrollOffset(this.doc)[1], win.innerHeight * SPY_LINE_RATIO);
    const root = this.doc.documentElement;
    const scrollable = root.scrollHeight > win.innerHeight;
    const atBottom = scrollable && win.scrollY + win.innerHeight >= root.scrollHeight - 2;
    const next = activeSectionIndex(tops, line, atBottom);
    if (next !== this.index()) {
      this.zone.run(() => this.index.set(next));
    }
  }
}
