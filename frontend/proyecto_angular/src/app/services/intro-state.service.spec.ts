import { TestBed } from '@angular/core/testing';
import { IntroStateService } from './intro-state.service';

function stubMatchMedia(reduce: boolean): void {
  spyOn(window, 'matchMedia').and.callFake((query: string) => {
    if (query === '(prefers-reduced-motion: reduce)') {
      return { matches: reduce } as MediaQueryList;
    }
    return { matches: false } as MediaQueryList;
  });
}

describe('IntroStateService', () => {
  it('debe reproducir la intro en la primera carga sin reduced-motion', () => {
    stubMatchMedia(false);
    TestBed.configureTestingModule({ providers: [IntroStateService] });
    const service = TestBed.inject(IntroStateService);
    expect(service.debeReproducirse()).toBeTrue();
  });

  it('no debe reproducir la intro una vez marcada como reproducida', () => {
    stubMatchMedia(false);
    TestBed.configureTestingModule({ providers: [IntroStateService] });
    const service = TestBed.inject(IntroStateService);
    service.marcarComoReproducida();
    expect(service.debeReproducirse()).toBeFalse();
  });

  it('no debe reproducir la intro con prefers-reduced-motion: reduce', () => {
    stubMatchMedia(true);
    TestBed.configureTestingModule({ providers: [IntroStateService] });
    const service = TestBed.inject(IntroStateService);
    expect(service.debeReproducirse()).toBeFalse();
  });
});