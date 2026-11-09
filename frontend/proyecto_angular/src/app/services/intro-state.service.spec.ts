import { TestBed } from '@angular/core/testing';
import { INTRO_SEEN_KEY, IntroStateService } from './intro-state.service';

function stubMatchMedia(reduce: boolean): void {
  spyOn(window, 'matchMedia').and.callFake((query: string) => {
    if (query === '(prefers-reduced-motion: reduce)') {
      return { matches: reduce } as MediaQueryList;
    }
    return { matches: false } as MediaQueryList;
  });
}

function createService(): IntroStateService {
  TestBed.configureTestingModule({ providers: [IntroStateService] });
  return TestBed.inject(IntroStateService);
}

describe('IntroStateService', () => {
  beforeEach(() => { sessionStorage.removeItem(INTRO_SEEN_KEY); localStorage.removeItem(INTRO_SEEN_KEY); });
  afterEach(() => { sessionStorage.removeItem(INTRO_SEEN_KEY); localStorage.removeItem(INTRO_SEEN_KEY); });

  it('debe reproducir la intro en la primera visita sin reduced-motion', () => {
    stubMatchMedia(false);
    expect(createService().debeReproducirse()).toBeTrue();
  });

  it('no debe reproducir la intro una vez marcada como reproducida', () => {
    stubMatchMedia(false);
    const service = createService();
    service.marcarComoReproducida();
    expect(service.debeReproducirse()).toBeFalse();
  });

  it('no debe reproducir la intro con prefers-reduced-motion: reduce', () => {
    stubMatchMedia(true);
    expect(createService().debeReproducirse()).toBeFalse();
  });

  it('con reduced-motion no marca la intro como vista en storage', () => {
    stubMatchMedia(true);
    createService().debeReproducirse();
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBeNull();
  });

  it('no reproduce la intro si el storage ya tiene la clave (recarga en la misma sesion)', () => {
    stubMatchMedia(false);
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    expect(createService().debeReproducirse()).toBeFalse();
  });

  it('ignora un valor distinto de "1" en la clave', () => {
    stubMatchMedia(false);
    sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
    expect(createService().debeReproducirse()).toBeTrue();
  });

  it('marcarComoReproducida persiste la clave kuvu.intro.seen = "1"', () => {
    stubMatchMedia(false);
    createService().marcarComoReproducida();
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe('1');
  });

  it('el recordado vive en sessionStorage y no en localStorage', () => {
    stubMatchMedia(false);
    createService().marcarComoReproducida();
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe('1');
    expect(localStorage.getItem(INTRO_SEEN_KEY)).toBeNull();
  });

  it('una clave en localStorage no evita la intro en una sesion nueva', () => {
    stubMatchMedia(false);
    localStorage.setItem(INTRO_SEEN_KEY, '1');
    expect(createService().debeReproducirse()).toBeTrue();
  });

  it('el recordado sobrevive a una instancia nueva del servicio', () => {
    stubMatchMedia(false);
    new IntroStateService().marcarComoReproducida();
    expect(new IntroStateService().debeReproducirse()).toBeFalse();
  });

  describe('con storage que lanza', () => {
    beforeEach(() => {
      stubMatchMedia(false);
      spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError');
      spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');
    });

    it('debeReproducirse no lanza y devuelve true en la primera vez', () => {
      const service = createService();
      expect(() => service.debeReproducirse()).not.toThrow();
      expect(service.debeReproducirse()).toBeTrue();
    });

    it('marcarComoReproducida no lanza y usa el fallback en memoria', () => {
      const service = createService();
      expect(() => service.marcarComoReproducida()).not.toThrow();
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(INTRO_SEEN_KEY, '1');
      expect(service.debeReproducirse()).toBeFalse();
    });
  });
});
