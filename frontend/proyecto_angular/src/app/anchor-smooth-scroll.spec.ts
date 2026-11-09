import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import {
  SMOOTH_ANCHORS_CLASS,
  SMOOTH_ANCHORS_TIMEOUT_MS,
  anchorSmoothScroll
} from './anchor-smooth-scroll';
import { MatchMediaStub } from './motion/testing/match-media.stub';

@Component({ standalone: true, template: '' })
class PageComponent {}

describe('anchorSmoothScroll', () => {
  const root = document.documentElement;
  let media: MatchMediaStub;
  let router: Router;

  async function start(url: string): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: PageComponent, data: { publicSite: true } },
          { path: 'servicios', component: PageComponent, data: { publicSite: true } },
          { path: 'dashboard', component: PageComponent }
        ])
      ]
    });
    TestBed.runInInjectionContext(anchorSmoothScroll);
    router = TestBed.inject(Router);
    await router.navigateByUrl(url);
  }

  beforeEach(() => {
    media = new MatchMediaStub({ reducedMotion: false }).install();
  });

  afterEach(() => {
    media.restore();
    root.classList.remove(SMOOTH_ANCHORS_CLASS);
  });

  it('turns on smooth scroll for an anchor of the same public page, until scrollend', async () => {
    await start('/');
    await router.navigateByUrl('/#como-funciona');
    expect(root.classList).toContain(SMOOTH_ANCHORS_CLASS);

    window.dispatchEvent(new Event('scrollend'));
    expect(root.classList).not.toContain(SMOOTH_ANCHORS_CLASS);
  });

  it('turns it off after the timeout when scrollend never comes', async () => {
    await start('/');
    jasmine.clock().install();
    try {
      await router.navigateByUrl('/#como-funciona');
      expect(root.classList).toContain(SMOOTH_ANCHORS_CLASS);
      jasmine.clock().tick(SMOOTH_ANCHORS_TIMEOUT_MS);
      expect(root.classList).not.toContain(SMOOTH_ANCHORS_CLASS);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('keeps the instant jump when moving to another page, even with a fragment', async () => {
    await start('/');
    await router.navigateByUrl('/servicios#planes');
    expect(root.classList).not.toContain(SMOOTH_ANCHORS_CLASS);
  });

  it('does nothing without a fragment', async () => {
    await start('/');
    await router.navigateByUrl('/?origen=menu');
    expect(root.classList).not.toContain(SMOOTH_ANCHORS_CLASS);
  });

  it('does nothing outside the public site', async () => {
    await start('/dashboard');
    await router.navigateByUrl('/dashboard#resumen');
    expect(root.classList).not.toContain(SMOOTH_ANCHORS_CLASS);
  });

  it('does nothing with reduced motion', async () => {
    media.set('reducedMotion', true);
    await start('/');
    await router.navigateByUrl('/#como-funciona');
    expect(root.classList).not.toContain(SMOOTH_ANCHORS_CLASS);
  });
});
