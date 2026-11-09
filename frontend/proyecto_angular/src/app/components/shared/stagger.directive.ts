import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';
import { reducedMotion } from '../../motion/motion-preferences';

/** Children that get their own delay; the rest share the last one. */
export const STAGGER_MAX_HIJOS = 12;
/** Time the container keeps `.is-staggering`: 12 × 40 ms of delay + the entry animation. */
export const STAGGER_DURACION_MS = 900;

/**
 * Staggered entry of a list (table body, card grid, indicators) the first time it is painted.
 * It numbers the children (`--stagger-i`) and adds `.is-staggering` for a moment; the CSS
 * animates them only while that class is on, so rows added later (a filter, a new record)
 * appear without replaying the entry. Does nothing with reduced motion.
 */
@Directive({
  selector: '[appStagger]',
  standalone: true
})
export class StaggerDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private timer?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    if (reducedMotion()) return;
    const host = this.el.nativeElement;
    Array.from(host.children).forEach((hijo, i) => {
      (hijo as HTMLElement).style.setProperty('--stagger-i', String(Math.min(i, STAGGER_MAX_HIJOS - 1)));
    });
    host.classList.add('is-staggering');
    this.timer = setTimeout(() => host.classList.remove('is-staggering'), STAGGER_DURACION_MS);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
