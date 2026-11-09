import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';
import { IntroStateService } from './services/intro-state.service';
import { routes } from './app.routes';
import { PUBLIC_TRANSITION_CLASS, isPublicSite, onRouteViewTransition } from './route-view-transition';

describe('onRouteViewTransition', () => {
  const root = document.documentElement;
  let introPending: boolean;
  let skipTransition: jasmine.Spy;
  let finish: () => void;

  /** Snapshot whose leaf is the real route config for `path` (keeps the publicSite flags). */
  function snapshotTo(path: string): ActivatedRouteSnapshot {
    const routeConfig = routes.find((r) => r.path === path);
    expect(routeConfig).withContext(path).toBeDefined();
    const leaf = { routeConfig, firstChild: null };
    return { routeConfig: null, firstChild: leaf } as unknown as ActivatedRouteSnapshot;
  }

  function run(from: string, to: string): void {
    const finished = new Promise<void>((resolve) => (finish = resolve));
    const info = {
      transition: { skipTransition, finished },
      from: snapshotTo(from),
      to: snapshotTo(to)
    } as unknown as ViewTransitionInfo;
    TestBed.runInInjectionContext(() => onRouteViewTransition(info));
  }

  beforeEach(() => {
    introPending = true;
    skipTransition = jasmine.createSpy('skipTransition');
    TestBed.configureTestingModule({
      providers: [{ provide: IntroStateService, useValue: { debeReproducirse: () => introPending } }]
    });
  });

  afterEach(() => root.classList.remove(PUBLIC_TRANSITION_CLASS));

  it('marks a public → public transition and clears the mark when it finishes', async () => {
    run('', 'servicios');
    expect(root.classList).toContain(PUBLIC_TRANSITION_CLASS);
    expect(skipTransition).not.toHaveBeenCalled();

    finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(root.classList).not.toContain(PUBLIC_TRANSITION_CLASS);
  });

  it('marks transitions to and from the 404 page', () => {
    run('nosotros', '**');
    expect(root.classList).toContain(PUBLIC_TRANSITION_CLASS);
  });

  it('skips the transition into the pending intro without the public mark', () => {
    run('', 'acceder');
    expect(skipTransition).toHaveBeenCalledTimes(1);
    expect(root.classList).not.toContain(PUBLIC_TRANSITION_CLASS);
  });

  it('keeps the default cross-fade from a public page to /login', () => {
    run('contacto', 'login');
    expect(skipTransition).not.toHaveBeenCalled();
    expect(root.classList).not.toContain(PUBLIC_TRANSITION_CLASS);
  });

  it('keeps the default cross-fade between signed-in routes', () => {
    run('dashboard', 'contratos');
    expect(skipTransition).not.toHaveBeenCalled();
    expect(root.classList).not.toContain(PUBLIC_TRANSITION_CLASS);
  });
});

describe('isPublicSite', () => {
  it('reads the flag on the deepest route', () => {
    const leaf = { routeConfig: { path: 'x', data: { publicSite: true } }, firstChild: null };
    const parent = { routeConfig: null, firstChild: leaf } as unknown as ActivatedRouteSnapshot;
    expect(isPublicSite(parent)).toBeTrue();
  });

  it('is false without a snapshot or without the flag', () => {
    expect(isPublicSite(null)).toBeFalse();
    const leaf = { routeConfig: { path: 'x' }, firstChild: null } as unknown as ActivatedRouteSnapshot;
    expect(isPublicSite(leaf)).toBeFalse();
  });
});
