import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { RevealDirective } from '../../../directives/reveal.directive';
import { motionChanges, reducedMotion } from '../../../motion/motion-preferences';
import { companies } from '../../../content';

/**
 * Copies of the list that exist only for the loop. With four short names one list is
 * narrower than the band, so each half of the track holds two lists (the real one plus one
 * copy, then two copies) and the `translateX(-50%)` loop has no visible seam.
 */
export const MARQUEE_COPIES = 3;

export const PAUSE_LABEL = 'Pausar animación de compañías';
export const RESUME_LABEL = 'Reanudar animación de compañías';

/**
 * "Compañías que confían" of the home as an endless band. Applied as an attribute on the home
 * `<section>`.
 *
 * - The real list is read once by screen readers; the loop copies are `aria-hidden` and
 *   `inert`.
 * - The band pauses on hover, while something inside has focus, with the pause button and
 *   while it is off screen (its own IntersectionObserver).
 * - With reduced motion the band is static: no copies, wrapped list and no pause button.
 */
@Component({
  selector: 'section[app-companies-marquee]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, RevealDirective],
  host: { '[class.is-static]': '!animated()' },
  templateUrl: './companies-marquee.component.html',
  styleUrls: ['./companies-marquee.component.scss']
})
export class CompaniesMarqueeComponent implements AfterViewInit, OnDestroy {
  readonly companies = companies;
  readonly copies = Array.from({ length: MARQUEE_COPIES }, (_, i) => i);

  readonly animated = signal(!reducedMotion());
  readonly paused = signal(false);
  readonly offscreen = signal(false);
  readonly toggleLabel = computed(() => (this.paused() ? RESUME_LABEL : PAUSE_LABEL));

  private readonly band = viewChild.required<ElementRef<HTMLElement>>('band');
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private changes?: Subscription;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.changes = motionChanges('reducedMotion').subscribe(() => this.animated.set(!reducedMotion()));
      if (typeof IntersectionObserver === 'function') {
        this.observer = new IntersectionObserver(([entry]) => this.offscreen.set(!entry.isIntersecting));
        this.observer.observe(this.band().nativeElement);
      }
    });
  }

  ngOnDestroy(): void {
    this.changes?.unsubscribe();
    this.observer?.disconnect();
  }

  toggle(): void {
    this.paused.update((paused) => !paused);
  }
}
