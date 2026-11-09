import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Decorative reading-progress bar of the home: fixed at the top of the window, its length is
 * `--page-progress` (0–1), which the ScrollMotionService publishes on the home host. Hidden
 * from assistive technology, not focusable and transparent to clicks. It has no CSS
 * transition: the scroll loop already updates it once per frame, with or without reduced motion.
 */
@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `<span class="bar"></span>`,
  styles: `
    :host {
      position: fixed;
      inset: 0 0 auto 0;
      z-index: 60;
      height: 3px;
      pointer-events: none;
    }

    .bar {
      display: block;
      height: 100%;
      transform-origin: left center;
      transform: scaleX(var(--page-progress, 0));
      background: linear-gradient(90deg, var(--color-primario, #2b4c8c), var(--color-secundario, #3a6fd8));
    }
  `
})
export class ScrollProgressBarComponent {}
