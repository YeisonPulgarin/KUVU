import { Directive, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { reducedMotion } from '../motion/motion-preferences';

/**
 * `[data-reveal]`: adds `.is-visible` when the element enters the viewport. The value of the
 * attribute picks the variant in the global styles: empty (fade-up) or `clip` (clip-path
 * opening). With reduced motion, or without IntersectionObserver, the element is visible at once.
 */
@Directive({ selector: '[data-reveal]', standalone: true })
export class RevealDirective implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  private readonly prefersReducedMotion = reducedMotion();

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (this.prefersReducedMotion) {
      this.el.nativeElement.classList.add('is-visible');
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.el.nativeElement.classList.add('is-visible');
      return;
    }

    const siblings = Array.from(
      this.el.nativeElement.parentElement?.querySelectorAll('[data-reveal]') ?? []
    );
    const index = siblings.indexOf(this.el.nativeElement);
    this.el.nativeElement.style.setProperty('--reveal-index', String(Math.max(index, 0)));

    this.observer = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
