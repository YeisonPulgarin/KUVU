import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HERO_TITLE, HomeHeroComponent } from './home-hero.component';
import { ScrollMotionService } from '../../../motion/scroll-motion.service';
import { MatchMediaStub } from '../../../motion/testing/match-media.stub';

@Component({
  standalone: true,
  imports: [HomeHeroComponent],
  providers: [ScrollMotionService],
  template: `<section id="inicio" class="hero" app-home-hero></section>`
})
class HostComponent {}

/** Text that assistive technology reaches: everything outside `aria-hidden` subtrees. */
function accessibleText(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('HomeHeroComponent', () => {
  let media: MatchMediaStub;

  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const hero = (fixture.nativeElement as HTMLElement).querySelector('section') as HTMLElement;
    return { fixture, hero };
  }

  afterEach(() => media.restore());

  describe('content and accessibility', () => {
    beforeEach(() => (media = new MatchMediaStub({ reducedMotion: false }).install()));

    it('announces the h1 as its full text, not word by word', () => {
      const { hero } = render();
      const h1 = hero.querySelector('h1') as HTMLElement;
      expect(accessibleText(h1)).toBe(HERO_TITLE);
      expect(h1.querySelectorAll('.w').length).toBe(HERO_TITLE.split(' ').length);
    });

    it('keeps the brand line, the subtitle and both CTAs', () => {
      const { hero } = render();
      expect(hero.querySelector('.hero-brand')?.textContent).toContain('KUVU');
      expect(hero.querySelector('.hero-subtitle')?.textContent).toContain(
        'Gestiona locales, contratos, pagos y mantenimientos'
      );
      const cta = hero.querySelector('a.hero-cta') as HTMLElement;
      expect(cta.textContent?.trim()).toBe('Ingresar');
      expect(cta.getAttribute('href')).toBe('/acceder');
      expect(hero.querySelector('a.hero-secondary')?.getAttribute('href')).toBe('/servicios');
    });

    it('makes the main CTA magnetic', () => {
      const { hero } = render();
      expect(hero.querySelector('a.hero-cta')?.classList).toContain('magnetic');
    });

    it('renders the scroll cue as decoration', () => {
      const { hero } = render();
      const cue = hero.querySelector('.hero-scroll-cue') as HTMLElement;
      expect(cue.getAttribute('aria-hidden')).toBe('true');
      expect(cue.children.length).toBe(0);
      expect(cue.textContent?.trim()).toBe('');
    });
  });

  describe('exit parallax', () => {
    it('tracks the hero on desktop without reduced motion', () => {
      media = new MatchMediaStub({ reducedMotion: false, desktop: true }).install();
      const register = spyOn(ScrollMotionService.prototype, 'register').and.callThrough();
      const { hero } = render();
      expect(register).toHaveBeenCalledTimes(1);
      const target = register.calls.mostRecent().args[0];
      expect(target.element).toBe(hero.querySelector('.hero-stage') as HTMLElement);
      expect(target.range).toBe('exit');
    });

    it('does not track the hero below 1024 px', () => {
      media = new MatchMediaStub({ reducedMotion: false, desktop: false }).install();
      const register = spyOn(ScrollMotionService.prototype, 'register').and.callThrough();
      render();
      expect(register).not.toHaveBeenCalled();
    });

    it('does not track the hero with reduced motion', () => {
      media = new MatchMediaStub({ reducedMotion: true, desktop: true }).install();
      const register = spyOn(ScrollMotionService.prototype, 'register').and.callThrough();
      render();
      expect(register).not.toHaveBeenCalled();
    });
  });
});
