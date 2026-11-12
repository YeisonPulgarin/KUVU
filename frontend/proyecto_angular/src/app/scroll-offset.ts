/** Extra space, in px, between the sticky header and the section an anchor scrolls to. */
export const ANCHOR_GAP = 16;

/** Offset used when the header cannot be measured (same value as `scroll-padding-top`). */
export const FALLBACK_SCROLL_OFFSET = 88;

/**
 * Vertical offset for anchor scrolling: the current height of the sticky site header plus a
 * small gap, so `/legal#cookies` lands below the header and, on the home, below the trail.
 * Measured on every scroll because the header changes height when it becomes compact; pages
 * without the public header get 0.
 */
export function headerScrollOffset(doc: Document): [number, number] {
  const header = doc.querySelector('app-site-header');
  if (!header) {
    return [0, 0];
  }
  const height = header.getBoundingClientRect().height;
  if (height <= 0) {
    return [0, FALLBACK_SCROLL_OFFSET];
  }
  // The home trail hangs under the bar (absolutely positioned, outside the header height).
  const trail = header.querySelector('.scroll-trail')?.getBoundingClientRect().height ?? 0;
  return [0, Math.ceil(height + trail) + ANCHOR_GAP];
}
