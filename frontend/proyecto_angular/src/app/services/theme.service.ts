import { Injectable, signal } from '@angular/core';

const THEME_KEY = 'kuvu-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);

  constructor() {
    this.isDark.set(this.readStoredTheme() === 'dark');
    this.apply();
  }

  toggle(): void {
    this.isDark.update((value) => !value);
    this.persist(this.isDark() ? 'dark' : 'light');
    this.apply();
  }

  private apply(): void {
    document.documentElement.classList.toggle('dark', this.isDark());
  }

  private readStoredTheme(): string | null {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  private persist(value: string): void {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {
      // Preferencia no persistida: la app sigue funcionando con el tema actual.
    }
  }
}