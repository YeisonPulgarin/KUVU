import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';
import { IntroStateService } from './services/intro-state.service';
import { INTRO_ROUTE_PATH, skipViewTransitionIntoIntro } from './intro-view-transition';

describe('skipViewTransitionIntoIntro', () => {
  let introPending: boolean;
  let skipTransition: jasmine.Spy;

  beforeEach(() => {
    introPending = true;
    skipTransition = jasmine.createSpy('skipTransition');
    TestBed.configureTestingModule({
      providers: [{ provide: IntroStateService, useValue: { debeReproducirse: () => introPending } }]
    });
  });

  function snapshotTo(path: string): ActivatedRouteSnapshot {
    const leaf = { routeConfig: { path }, firstChild: null };
    return { routeConfig: null, firstChild: leaf } as unknown as ActivatedRouteSnapshot;
  }

  function run(path: string): void {
    const info = {
      transition: { skipTransition },
      to: snapshotTo(path),
      from: snapshotTo('')
    } as unknown as ViewTransitionInfo;
    TestBed.runInInjectionContext(() => skipViewTransitionIntoIntro(info));
  }

  it('salta el cross-fade al entrar a /acceder con la intro pendiente (D9)', () => {
    run(INTRO_ROUTE_PATH);
    expect(skipTransition).toHaveBeenCalledTimes(1);
  });

  it('mantiene el cross-fade si la intro ya se vio en la sesion', () => {
    introPending = false;
    run(INTRO_ROUTE_PATH);
    expect(skipTransition).not.toHaveBeenCalled();
  });

  it('mantiene el cross-fade en las demas rutas', () => {
    run('nosotros');
    run('');
    expect(skipTransition).not.toHaveBeenCalled();
  });
});
