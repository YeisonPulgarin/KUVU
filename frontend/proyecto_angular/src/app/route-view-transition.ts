import { DOCUMENT, inject } from '@angular/core';
import { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';
import { skipViewTransitionIntoIntro } from './intro-view-transition';

/** Class on `<html>` while a transition between two public-site pages runs. */
export const PUBLIC_TRANSITION_CLASS = 'vt-public';

/** True when the deepest route of the snapshot declares `data: { publicSite: true }`. */
export function isPublicSite(snapshot: ActivatedRouteSnapshot | null | undefined): boolean {
  let leaf = snapshot;
  while (leaf?.firstChild) leaf = leaf.firstChild;
  return leaf?.routeConfig?.data?.['publicSite'] === true;
}

/**
 * Router view-transition hook (withViewTransitions contract, runs in an injection context).
 * 1. Entering the intro skips the cross-fade (skipViewTransitionIntoIntro, unchanged).
 * 2. Between two public-site pages it marks `<html>` with `vt-public` until the transition
 *    finishes: the global styles keep the header still and slide only the content. `/acceder`,
 *    `/login` and the signed-in app have no `publicSite` flag and keep the default cross-fade.
 */
export function onRouteViewTransition(info: ViewTransitionInfo): void {
  skipViewTransitionIntoIntro(info);
  if (!isPublicSite(info.from) || !isPublicSite(info.to)) {
    return;
  }
  const root = inject(DOCUMENT).documentElement;
  root.classList.add(PUBLIC_TRANSITION_CLASS);
  const clear = () => root.classList.remove(PUBLIC_TRANSITION_CLASS);
  info.transition.finished.then(clear, clear);
}
