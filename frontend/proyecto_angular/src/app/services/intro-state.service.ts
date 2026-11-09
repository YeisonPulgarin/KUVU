import { Injectable } from '@angular/core';

export const INTRO_SEEN_KEY = 'kuvu.intro.seen';

/**
 * Remembers whether the /acceder intro was already shown in this tab session.
 * Uses sessionStorage when available (survives F5 and in-app navigation; a new
 * session shows the intro again) and falls back to an in-memory flag, so a
 * blocked storage shows the intro at most once per app load and never throws.
 */
@Injectable({ providedIn: 'root' })
export class IntroStateService {
  private seenInMemory = false;
  private readonly reducedMotion: boolean;

  constructor() {
    this.reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  debeReproducirse(): boolean {
    return !this.reducedMotion && !this.seenInMemory && !this.readSeenFromStorage();
  }

  marcarComoReproducida(): void {
    this.seenInMemory = true;
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // Storage unavailable: the in-memory flag is enough for this load.
    }
  }

  private readSeenFromStorage(): boolean {
    try {
      return sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
    } catch {
      return false;
    }
  }
}
