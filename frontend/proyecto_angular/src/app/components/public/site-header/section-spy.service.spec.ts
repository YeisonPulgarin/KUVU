import { TestBed } from '@angular/core/testing';
import { SPY_LINE_RATIO, SectionSpyService, activeSectionIndex } from './section-spy.service';
import { AnimationFrameStub } from '../../../motion/testing/animation-frame.stub';
import { homeSpySections } from '../../../content/site';

describe('activeSectionIndex', () => {
  it('should be -1 without sections', () => {
    expect(activeSectionIndex([], 100, false)).toBe(-1);
  });

  it('should keep the first section before any top crosses the line', () => {
    expect(activeSectionIndex([150, 900, 1800], 100, false)).toBe(0);
  });

  it('should pick the last section whose top crossed the line', () => {
    expect(activeSectionIndex([-1200, -300, 90, 700], 100, false)).toBe(2);
    expect(activeSectionIndex([-1200, -300, 100, 700], 100, false)).toBe(2);
  });

  it('should pick the last section at the bottom of the page', () => {
    expect(activeSectionIndex([-3000, -2000, -900, 400], 100, true)).toBe(3);
  });
});

describe('SectionSpyService', () => {
  let service: SectionSpyService;
  let frames: AnimationFrameStub;
  let tops: Record<string, number>;
  let host: HTMLElement;
  const line = () => window.innerHeight * SPY_LINE_RATIO;

  beforeEach(() => {
    frames = new AnimationFrameStub();
    // The Karma page is not the home: make it non-scrollable so "bottom of the page" never applies.
    spyOnProperty(document.documentElement, 'scrollHeight').and.returnValue(window.innerHeight);
    host = document.createElement('div');
    tops = {};
    homeSpySections.forEach((section, i) => {
      const el = document.createElement('section');
      el.id = section.id;
      tops[section.id] = 2000 + i * 1000;
      spyOn(el, 'getBoundingClientRect').and.callFake(
        () => ({ top: tops[section.id] }) as DOMRect
      );
      host.appendChild(el);
    });
    document.body.appendChild(host);
    service = TestBed.inject(SectionSpyService);
  });

  afterEach(() => {
    service.stop();
    host.remove();
  });

  /** Places section `n` at the reading line and the earlier ones above it. */
  const scrollTo = (n: number) => {
    homeSpySections.forEach((section, i) => {
      tops[section.id] = i <= n ? line() - (n - i) * 800 - 1 : line() + (i - n) * 800;
    });
    window.dispatchEvent(new Event('scroll'));
    frames.flush();
  };

  it('should be stopped by default: no active item and no trail', () => {
    expect(service.activeHref()).toBeNull();
    expect(service.trail()).toEqual([]);
  });

  it('should compute the active section as soon as it starts', () => {
    service.start(homeSpySections);
    expect(service.activeHref()).toBe('/');
    expect(service.trail().map((item) => item.label)).toEqual(['Inicio']);
  });

  it('should grow the trail as the visitor scrolls down and shrink it going back up', () => {
    service.start(homeSpySections);

    scrollTo(1);
    expect(service.activeHref()).toBe('/servicios');
    expect(service.trail().map((item) => item.label)).toEqual(['Inicio', 'Servicios']);

    scrollTo(2);
    expect(service.activeHref()).toBe('/nosotros');
    expect(service.trail().map((item) => item.label)).toEqual(['Inicio', 'Servicios', 'Nosotros']);
    expect(service.trail().map((item) => item.fragment)).toEqual(['inicio', 'servicios', 'equipo']);

    scrollTo(0);
    expect(service.trail().map((item) => item.label)).toEqual(['Inicio']);
  });

  it('should coalesce a burst of scroll events into one frame', () => {
    service.start(homeSpySections);
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    expect(frames.pending).toBe(1);
  });

  it('should reset and stop listening when stopped', () => {
    service.start(homeSpySections);
    scrollTo(3);
    expect(service.activeHref()).toBe('/preguntas-frecuentes');

    service.stop();
    expect(service.activeHref()).toBeNull();
    expect(service.trail()).toEqual([]);

    window.dispatchEvent(new Event('scroll'));
    expect(frames.pending).toBe(0);
  });

  it('should cancel a pending frame when stopped', () => {
    service.start(homeSpySections);
    window.dispatchEvent(new Event('scroll'));
    service.stop();
    expect(frames.cancel).toHaveBeenCalled();
    expect(frames.pending).toBe(0);
  });
});
