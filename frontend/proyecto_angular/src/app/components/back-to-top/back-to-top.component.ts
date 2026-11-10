import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { reducedMotion } from '../../motion/motion-preferences';

/** Scroll container of the signed-in app; every other page scrolls the window. */
export const APP_SCROLLER_SELECTOR = '.main-content';

/** The button shows once the scrolled distance passes this many viewport heights. */
export const BACK_TO_TOP_VIEWPORTS = 1;

type Scroller = Window | HTMLElement;

/**
 * Floating "Volver arriba" button, mounted once at the app root. It follows whichever
 * container is scrolling the current page (the window, or `.main-content` in the signed-in
 * app) through a single capture-phase `scroll` listener: element scroll events do not
 * bubble, but they do go through capture. Scrolls of other elements (tables, the mobile menu
 * panel, dialogs) are ignored.
 */
@Component({
  selector: 'app-back-to-top',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="back-to-top"
      [class.is-visible]="visible()"
      [attr.aria-hidden]="visible() ? null : 'true'"
      [attr.tabindex]="visible() ? null : -1"
      aria-label="Volver arriba"
      title="Volver arriba"
      (click)="toTop()"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 19V5"/>
        <path d="m5 12 7-7 7 7"/>
      </svg>
    </button>
  `,
  styles: [`
    /* Layers: above page content (0) and below the public header with its mobile panel (50),
       the home progress bar and grain (60), the mobile sidebar (150-250) and toasts (400).
       Dialogs live in the top layer. */
    .back-to-top {
      position: fixed;
      right: max(1.25rem, env(safe-area-inset-right));
      bottom: max(1.25rem, env(safe-area-inset-bottom));
      z-index: 45;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      padding: 0;
      border: 1px solid color-mix(in srgb, #fff 22%, transparent);
      border-radius: 50%;
      background-color: var(--color-brand-700);
      color: #fff;
      box-shadow: 0 10px 24px -10px rgb(0 0 0 / 0.45), 0 2px 6px rgb(0 0 0 / 0.18);
      cursor: pointer;
      visibility: hidden;
      opacity: 0;
      transform: translateY(12px) scale(0.9);
      -webkit-tap-highlight-color: transparent;
    }

    .back-to-top.is-visible {
      visibility: visible;
      opacity: 1;
      transform: none;
    }

    .back-to-top svg {
      width: 22px;
      height: 22px;
    }

    .back-to-top:focus-visible {
      outline: 3px solid var(--color-brand-600);
      outline-offset: 3px;
    }

    @media (prefers-reduced-motion: no-preference) {
      .back-to-top {
        transition:
          opacity var(--dur-fast) var(--ease-out-expo),
          transform var(--dur-base) var(--ease-out-expo),
          visibility 0s linear var(--dur-base);
      }

      .back-to-top.is-visible {
        transition:
          opacity var(--dur-fast) var(--ease-out-expo),
          transform var(--dur-base) var(--ease-out-expo),
          visibility 0s;
      }

      .back-to-top.is-visible:hover {
        transform: translateY(-2px);
      }

      .back-to-top.is-visible:hover svg {
        transform: translateY(-1px);
      }

      .back-to-top svg {
        transition: transform var(--dur-fast) var(--ease-out-expo);
      }
    }
  `]
})
export class BackToTopComponent {
  readonly visible = signal(false);

  private readonly document = inject(DOCUMENT);
  private scroller: Scroller | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => {
        // The new view starts at the top; a previous `.main-content` is gone with its route.
        this.scroller = null;
        this.visible.set(false);
      });

    afterNextRender(() => {
      const onScroll = (event: Event) => this.onScroll(event);
      const options = { capture: true, passive: true } as const;
      this.document.addEventListener('scroll', onScroll, options);
      destroyRef.onDestroy(() => this.document.removeEventListener('scroll', onScroll, options));
    });
  }

  /** Scrolls the tracked container back to its top; instant under reduced motion. */
  toTop(): void {
    const target = this.scroller ?? this.document.defaultView;
    target?.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  private onScroll(event: Event): void {
    const scroller = this.scrollerOf(event.target);
    if (!scroller) return;
    this.scroller = scroller;
    this.visible.set(this.pastThreshold(scroller));
  }

  private scrollerOf(target: EventTarget | null): Scroller | null {
    if (target === this.document || target === this.document.documentElement) {
      return this.document.defaultView;
    }
    if (target instanceof HTMLElement && target.matches(APP_SCROLLER_SELECTOR)) {
      return target;
    }
    return null;
  }

  private pastThreshold(scroller: Scroller): boolean {
    if (scroller instanceof HTMLElement) {
      return scroller.scrollTop > scroller.clientHeight * BACK_TO_TOP_VIEWPORTS;
    }
    return scroller.scrollY > scroller.innerHeight * BACK_TO_TOP_VIEWPORTS;
  }
}
