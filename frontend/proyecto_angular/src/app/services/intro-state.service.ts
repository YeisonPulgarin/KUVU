import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IntroStateService {
  private introVistoEnEstaCarga = false;
  private reducedMotion: boolean;

  constructor() {
    this.reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  debeReproducirse(): boolean {
    return !this.introVistoEnEstaCarga && !this.reducedMotion;
  }

  marcarComoReproducida(): void {
    this.introVistoEnEstaCarga = true;
  }
}