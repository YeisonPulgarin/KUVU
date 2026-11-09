import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepsJourneyComponent } from './steps-journey.component';
import { ScrollMotionService, ScrollTarget } from '../../../motion/scroll-motion.service';
import { MatchMediaStub } from '../../../motion/testing/match-media.stub';
import { howItWorks } from '../../../content';

@Component({
  standalone: true,
  imports: [StepsJourneyComponent],
  template: `<section id="como-funciona" class="section steps" app-steps-journey></section>`
})
class HostComponent {}

describe('StepsJourneyComponent', () => {
  let media: MatchMediaStub;
  let register: jasmine.Spy;
  let fixture: ComponentFixture<HostComponent>;
  let section: HTMLElement;

  function render(): void {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    section = (fixture.nativeElement as HTMLElement).querySelector('section') as HTMLElement;
  }

  const steps = () => Array.from(section.querySelectorAll<HTMLElement>('li.step'));
  const current = () => steps().filter((s) => s.getAttribute('aria-current') === 'step');

  /** Simulates the scroll loop reporting a progress for the tall stage. */
  function progress(value: number): void {
    const target: ScrollTarget = register.calls.mostRecent().args[0];
    target.write(value);
    fixture.detectChanges();
  }

  beforeEach(() => {
    register = jasmine.createSpy('register').and.returnValue(() => {});
    TestBed.configureTestingModule({
      providers: [{ provide: ScrollMotionService, useValue: { register } }]
    });
  });

  afterEach(() => media.restore());

  describe('on desktop without reduced motion', () => {
    beforeEach(() => {
      media = new MatchMediaStub({ desktop: true, reducedMotion: false }).install();
      render();
    });

    it('renders the four steps with their texts, in an ordered list', () => {
      expect(section.querySelector('ol')).toBeTruthy();
      expect(steps().map((s) => s.querySelector('h3')?.textContent)).toEqual(howItWorks.map((s) => s.title));
      expect(steps()[0].querySelector('.step-number')?.textContent?.trim()).toBe('1');
    });

    it('turns on the journey and tracks the tall stage', () => {
      expect(section.classList).toContain('is-journey');
      const target: ScrollTarget = register.calls.mostRecent().args[0];
      expect(target.element).toBe(section.querySelector('.steps-stage') as HTMLElement);
      expect(target.range).toBe('contain');
    });

    it('marks exactly one active step that follows the progress', () => {
      expect(current()).toEqual([steps()[0]]);

      progress(0.3);
      expect(current()).toEqual([steps()[1]]);
      expect(steps()[1].classList).toContain('is-active');

      progress(0.6);
      expect(current()).toEqual([steps()[2]]);

      progress(1);
      expect(current()).toEqual([steps()[3]]);

      progress(0);
      expect(current()).toEqual([steps()[0]]);
    });

    it('never hides a step from assistive technology', () => {
      progress(0.8);
      steps().forEach((step) => {
        expect(step.closest('[aria-hidden="true"]')).toBeNull();
        expect(getComputedStyle(step).display).not.toBe('none');
      });
    });

    // The brand tokens come from the global @theme static block (styles.css); without them
    // on :root the line and its track are invisible.
    it('draws the progress line and its track with the brand colours', () => {
      const line = section.querySelector('.steps-line') as HTMLElement;
      const track = section.querySelector('.steps-track') as HTMLElement;
      expect(getComputedStyle(line).backgroundColor).toBe('rgb(62, 92, 64)');
      expect(getComputedStyle(track, '::before').backgroundColor).toBe('rgb(205, 220, 205)');
    });

    it('drops the journey when the viewport goes below 1024 px', () => {
      media.set('desktop', false);
      fixture.detectChanges();
      expect(section.classList).not.toContain('is-journey');
      expect(current().length).toBe(0);
    });
  });

  it('is a plain list without active step on mobile', () => {
    media = new MatchMediaStub({ desktop: false, reducedMotion: false }).install();
    render();
    expect(register).not.toHaveBeenCalled();
    expect(section.classList).not.toContain('is-journey');
    expect(steps().length).toBe(4);
    expect(current().length).toBe(0);
    steps().forEach((step) => expect(step.hasAttribute('data-reveal')).toBeTrue());
  });

  it('is a static list without active step with reduced motion', () => {
    media = new MatchMediaStub({ desktop: true, reducedMotion: true }).install();
    render();
    expect(register).not.toHaveBeenCalled();
    expect(section.classList).not.toContain('is-journey');
    expect(current().length).toBe(0);
    steps().forEach((step) => expect(step.classList).toContain('is-visible'));
  });

  it('stops listening to preference changes on destroy', () => {
    media = new MatchMediaStub({ desktop: true, reducedMotion: false }).install();
    render();
    fixture.destroy();
    expect(media.listenerCount('desktop')).toBe(0);
    expect(media.listenerCount('reducedMotion')).toBe(0);
  });
});
