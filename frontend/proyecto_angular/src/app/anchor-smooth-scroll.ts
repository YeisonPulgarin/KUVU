import { DOCUMENT, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { reducedMotion } from './motion/motion-preferences';
import { isPublicSite } from './route-view-transition';

/** Class on `<html>` that turns on `scroll-behavior: smooth` (see styles.scss). */
export const SMOOTH_ANCHORS_CLASS = 'smooth-anchors';

/** Upper bound for the smooth scroll: the class goes away even without `scrollend`. */
export const SMOOTH_ANCHORS_TIMEOUT_MS = 1000;

const pathOf = (url: string) => url.split(/[?#]/)[0];

/**
 * App initializer. Smooth scroll applies only while the router scrolls to an anchor of the
 * same public page (`/#como-funciona` from `/`). Moving to another page keeps the instant jump
 * to the top, wheel and keyboard scrolling are untouched, and reduced motion turns it off.
 * The class is removed on `scrollend` or after SMOOTH_ANCHORS_TIMEOUT_MS, whichever comes first.
 */
export function anchorSmoothScroll(): void {
  const router = inject(Router);
  const doc = inject(DOCUMENT);
  const win = doc.defaultView;
  const root = doc.documentElement;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clear = () => {
    root.classList.remove(SMOOTH_ANCHORS_CLASS);
    win?.removeEventListener('scrollend', clear);
    clearTimeout(timer);
    timer = undefined;
  };

  router.events
    .pipe(
      filter((event): event is NavigationStart => event instanceof NavigationStart),
      takeUntilDestroyed(inject(DestroyRef))
    )
    .subscribe((event) => {
      const fragment = router.parseUrl(event.url).fragment;
      const samePage = pathOf(event.url) === pathOf(router.url);
      if (!fragment || !samePage || reducedMotion() || !isPublicSite(router.routerState.snapshot.root)) {
        return;
      }
      clear();
      root.classList.add(SMOOTH_ANCHORS_CLASS);
      win?.addEventListener('scrollend', clear, { once: true, passive: true });
      timer = setTimeout(clear, SMOOTH_ANCHORS_TIMEOUT_MS);
    });
}
