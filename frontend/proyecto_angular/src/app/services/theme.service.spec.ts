import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should start in light mode by default', () => {
    const service = new ThemeService();
    expect(service.isDark()).toBeFalse();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });

  it('should apply the dark class and persist the preference when enabled', () => {
    const service = new ThemeService();
    service.toggle();
    expect(service.isDark()).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(localStorage.getItem('kuvu-theme')).toBe('dark');
  });

  it('should remove the dark class and persist the light preference when disabled', () => {
    const service = new ThemeService();
    service.toggle();
    service.toggle();
    expect(service.isDark()).toBeFalse();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(localStorage.getItem('kuvu-theme')).toBe('light');
  });

  it('should restore the persisted dark preference on init', () => {
    localStorage.setItem('kuvu-theme', 'dark');
    const service = new ThemeService();
    expect(service.isDark()).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
  });

  it('should keep working when localStorage.getItem throws (storage disabled)', () => {
    spyOn(localStorage, 'getItem').and.throwError('SecurityError');
    const service = new ThemeService();
    expect(service.isDark()).toBeFalse();
  });

  it('should not crash when localStorage.setItem throws (quota exceeded)', () => {
    const service = new ThemeService();
    spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
    expect(() => service.toggle()).not.toThrow();
    expect(service.isDark()).toBeTrue();
  });
});