import { Directive, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';

@Directive({ selector: '[data-reveal]', standalone: true })
export class RevealDirective implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  private readonly prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

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