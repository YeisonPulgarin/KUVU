import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CompaniesMarqueeComponent,
  MARQUEE_COPIES,
  PAUSE_LABEL,
  RESUME_LABEL
} from './companies-marquee.component';
import { MatchMediaStub } from '../../../motion/testing/match-media.stub';
import { IntersectionObserverStub } from '../../../motion/testing/intersection-observer.stub';
import { companies } from '../../../content';

@Component({
  standalone: true,
  imports: [CompaniesMarqueeComponent],
  template: `<section id="companias" class="section companies" app-companies-marquee></section>`
})
class HostComponent {}

/** Text nodes that assistive technology reaches: everything outside `aria-hidden` subtrees. */
function accessibleItems(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>('.company-item'))
    .filter((item) => !item.closest('[aria-hidden="true"]') && !item.closest('[inert]'))
    .map((item) => item.textContent?.trim() ?? '');
}

describe('CompaniesMarqueeComponent', () => {
  let media: MatchMediaStub;
  let fixture: ComponentFixture<HostComponent>;
  let section: HTMLElement;

  function render(): void {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    section = (fixture.nativeElement as HTMLElement).querySelector('section') as HTMLElement;
  }

  const band = () => section.querySelector('.marquee') as HTMLElement;
  // The reveal directive also observes the band (with a threshold); the marquee's own observer has no options.
  const marqueeObserver = () =>
    IntersectionObserverStub.instances.find((o) => o.observed.has(band()) && !o.options)!;
  const toggle = () => section.querySelector('button.marquee-toggle') as HTMLButtonElement | null;

  beforeEach(() => IntersectionObserverStub.install());

  afterEach(() => {
    media.restore();
    IntersectionObserverStub.restore();
  });

  describe('animated', () => {
    beforeEach(() => {
      media = new MatchMediaStub({ reducedMotion: false }).install();
      render();
    });

    it('exposes each company exactly once to assistive technology', () => {
      expect(accessibleItems(section)).toEqual(companies.map((c) => c.name));
    });

    it('hides the loop copies from assistive technology and from the focus order', () => {
      const copies = Array.from(section.querySelectorAll<HTMLElement>('.marquee-copy'));
      expect(copies.length).toBe(MARQUEE_COPIES);
      copies.forEach((copy) => {
        expect(copy.getAttribute('aria-hidden')).toBe('true');
        expect(copy.hasAttribute('inert')).toBeTrue();
        expect(copy.textContent).toContain(companies[0].name);
      });
    });

    it('keeps the wordmark classes of the content', () => {
      const real = section.querySelector('.marquee-list:not(.marquee-copy)') as HTMLElement;
      const items = Array.from(real.querySelectorAll('.company-item'));
      items.forEach((item, i) => expect(item.classList).toContain(companies[i].className));
    });

    it('pauses and resumes with the button, updating its state and name', () => {
      const button = toggle()!;
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-pressed')).toBe('false');
      expect(button.textContent?.trim()).toBe(PAUSE_LABEL);
      expect(band().classList).not.toContain('is-paused');

      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(button.textContent?.trim()).toBe(RESUME_LABEL);
      expect(band().classList).toContain('is-paused');

      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-pressed')).toBe('false');
      expect(band().classList).not.toContain('is-paused');
    });

    it('outlines the pause button even without the light theme tokens on :root', () => {
      expect(getComputedStyle(toggle()!).borderTopColor).toBe('rgb(205, 220, 205)');
    });

    it('marks the band off screen while it is out of view', () => {
      const observer = marqueeObserver();
      observer.trigger(band(), false);
      fixture.detectChanges();
      expect(band().classList).toContain('is-offscreen');

      observer.trigger(band(), true);
      fixture.detectChanges();
      expect(band().classList).not.toContain('is-offscreen');
    });

    it('keeps the companies group marked for reveal', () => {
      expect(section.querySelector('.companies-list[data-reveal]')).toBeTruthy();
    });

    it('disconnects its observer on destroy', () => {
      const observer = marqueeObserver();
      fixture.destroy();
      expect(observer.disconnected).toBeTrue();
      expect(media.listenerCount('reducedMotion')).toBe(0);
    });
  });

  describe('with reduced motion', () => {
    beforeEach(() => {
      media = new MatchMediaStub({ reducedMotion: true }).install();
      render();
    });

    it('is static: no copies, no pause button, every company readable once', () => {
      expect(section.classList).toContain('is-static');
      expect(section.querySelectorAll('.marquee-copy').length).toBe(0);
      expect(toggle()).toBeNull();
      expect(accessibleItems(section)).toEqual(companies.map((c) => c.name));
    });

    it('starts the loop when reduced motion is turned off', () => {
      media.set('reducedMotion', false);
      fixture.detectChanges();
      expect(section.classList).not.toContain('is-static');
      expect(section.querySelectorAll('.marquee-copy').length).toBe(MARQUEE_COPIES);
      expect(toggle()).toBeTruthy();
    });
  });
});
