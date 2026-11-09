import { inject } from '@angular/core';
import { ViewTransitionInfo } from '@angular/router';
import { IntroStateService } from './services/intro-state.service';

/** Route that opens with the "turning page" intro when it has not been seen yet. */
export const INTRO_ROUTE_PATH = 'acceder';

/**
 * Router view-transition hook. A navigation into the intro skips the default
 * cross-fade: the intro is the transition, and the cross-fade would keep the
 * old page on screen for its first ~350 ms, while the house is being drawn.
 * Runs in an injection context (withViewTransitions contract).
 */
export function skipViewTransitionIntoIntro({ transition, to }: ViewTransitionInfo): void {
  let leaf = to;
  while (leaf.firstChild) leaf = leaf.firstChild;
  if (leaf.routeConfig?.path === INTRO_ROUTE_PATH && inject(IntroStateService).debeReproducirse()) {
    transition.skipTransition();
  }
}
