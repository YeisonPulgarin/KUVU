import { Observable } from 'rxjs';

/**
 * The three media queries that gate motion in TypeScript. CSS repeats them in its own media
 * queries; this is the single source for scripts.
 */
export const MOTION_QUERIES = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  finePointer: '(hover: hover) and (pointer: fine)',
  desktop: '(min-width: 1024px)'
} as const;

export type MotionQuery = keyof typeof MOTION_QUERIES;

function mediaQuery(name: MotionQuery): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }
  return window.matchMedia(MOTION_QUERIES[name]);
}

/** True when the user asked for reduced motion, or when it cannot be known (static by default). */
export function reducedMotion(): boolean {
  return mediaQuery('reducedMotion')?.matches ?? true;
}

/** True for a mouse or trackpad: hover plus a fine pointer. */
export function finePointer(): boolean {
  return mediaQuery('finePointer')?.matches ?? false;
}

/** True for viewports 1024 px wide or more (the `lg` breakpoint). */
export function desktop(): boolean {
  return mediaQuery('desktop')?.matches ?? false;
}

/**
 * Emits whenever any of the given queries changes (rotation, resize, system preference).
 * Listeners are removed on unsubscribe.
 */
export function motionChanges(...names: MotionQuery[]): Observable<void> {
  return new Observable<void>((subscriber) => {
    const lists = names
      .map(mediaQuery)
      .filter((list): list is MediaQueryList => list !== null);
    const onChange = () => subscriber.next();
    lists.forEach((list) => list.addEventListener('change', onChange));
    return () => lists.forEach((list) => list.removeEventListener('change', onChange));
  });
}
