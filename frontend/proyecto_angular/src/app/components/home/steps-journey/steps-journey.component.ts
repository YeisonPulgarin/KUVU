import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  computed,
  inject,
  signal
} from '@angular/core';
import { RevealDirective } from '../../../directives/reveal.directive';
import { desktop, motionChanges, reducedMotion } from '../../../motion/motion-preferences';
import { ScrollProgressDirective } from '../../../motion/scroll-progress.directive';
import { howItWorks } from '../../../content';

/**
 * "¿Cómo funciona?" of the home. Applied as an attribute on the home `<section>`.
 *
 * - Desktop without reduced motion ("journey"): the section is tall and its content sticks
 *   while the user scrolls through it; a line fills with the progress and the step under it is
 *   the active one (`aria-current="step"`), the rest stay dimmed but readable.
 * - Mobile or reduced motion: a plain list, each step with the fade-up reveal; no sticky box,
 *   no line and no active step.
 *
 * The four steps are always in the DOM and readable by assistive technology.
 */
@Component({
  selector: 'section[app-steps-journey]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, ScrollProgressDirective],
  host: { '[class.is-journey]': 'journey()' },
  templateUrl: './steps-journey.component.html',
  styleUrls: ['./steps-journey.component.scss']
})
export class StepsJourneyComponent {
  readonly steps = howItWorks;

  /** True on desktop without reduced motion: sticky box, progress line and active step. */
  readonly journey = signal(this.journeyAllowed());
  private readonly progressStep = signal(0);

  /** Index of the active step, or null outside the journey. */
  readonly activeStep = computed(() => (this.journey() ? this.progressStep() : null));

  constructor() {
    const subscription = inject(NgZone).runOutsideAngular(() =>
      motionChanges('reducedMotion', 'desktop').subscribe(() => this.journey.set(this.journeyAllowed()))
    );
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }

  /** Progress (0–1) of the tall stage: maps to one of the steps, published only on change. */
  onProgress(progress: number): void {
    const step = Math.min(this.steps.length - 1, Math.max(0, Math.floor(progress * this.steps.length)));
    if (step !== this.progressStep()) {
      this.progressStep.set(step);
    }
  }

  private journeyAllowed(): boolean {
    return desktop() && !reducedMotion();
  }
}
