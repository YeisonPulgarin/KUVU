import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevealDirective } from './reveal.directive';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback?: IntersectionObserverCallback;
  target?: Element;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.target = target;
  }

  unobserve(): void {}
  disconnect(): void {}

  trigger(isIntersecting: boolean): void {
    const entry = {
      target: this.target,
      isIntersecting
    } as unknown as IntersectionObserverEntry;
    this.callback?.([entry], this as unknown as IntersectionObserver);
  }
}

@Component({
  selector: 'app-reveal-host',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <div class="item" data-reveal></div>
    <div class="item" data-reveal></div>
  `
})
class RevealHostComponent {}

function matchMediaStub(matches: boolean): MediaQueryList {
  return {
    matches,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  } as unknown as MediaQueryList;
}

describe('RevealDirective', () => {
  let originalIntersectionObserver: typeof IntersectionObserver;
  let items: HTMLElement[];

  function readItems(fixture: ComponentFixture<RevealHostComponent>): void {
    const host = fixture.nativeElement as HTMLElement;
    items = Array.from(host.querySelectorAll('.item')) as HTMLElement[];
  }

  beforeAll(() => {
    originalIntersectionObserver = window.IntersectionObserver;
  });

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
    MockIntersectionObserver.instances = [];
  });

  describe('with reduced motion enabled', () => {
    beforeEach(() => {
      spyOn(window, 'matchMedia').and.returnValue(
        matchMediaStub(true)
      );
    });

    it('should reveal content immediately without creating an observer', () => {
      const fixture = TestBed.createComponent(RevealHostComponent);
      fixture.detectChanges();
      readItems(fixture);
      expect(items.every((item) => item.classList.contains('is-visible'))).toBeTrue();
      expect(MockIntersectionObserver.instances.length).toBe(0);
    });
  });

  describe('with reduced motion disabled', () => {
    beforeEach(() => {
      spyOn(window, 'matchMedia').and.returnValue(
        matchMediaStub(false)
      );
      window.IntersectionObserver =
        MockIntersectionObserver as unknown as typeof IntersectionObserver;
    });

    it('should keep items hidden until they intersect', () => {
      const fixture = TestBed.createComponent(RevealHostComponent);
      fixture.detectChanges();
      readItems(fixture);
      expect(items.every((item) => item.classList.contains('is-visible'))).toBeFalse();
    });

    it('should reveal an item when it enters the viewport', () => {
      const fixture = TestBed.createComponent(RevealHostComponent);
      fixture.detectChanges();
      readItems(fixture);
      MockIntersectionObserver.instances[0].trigger(true);
      fixture.detectChanges();
      expect(items[0].classList.contains('is-visible')).toBeTrue();
      expect(items[1].classList.contains('is-visible')).toBeFalse();
    });

    it('should stagger siblings with an increasing --reveal-index', () => {
      const fixture = TestBed.createComponent(RevealHostComponent);
      fixture.detectChanges();
      readItems(fixture);
      expect(items[0].style.getPropertyValue('--reveal-index')).toBe('0');
      expect(items[1].style.getPropertyValue('--reveal-index')).toBe('1');
    });
  });

  describe('without IntersectionObserver support', () => {
    beforeEach(() => {
      spyOn(window, 'matchMedia').and.returnValue(
        matchMediaStub(false)
      );
      delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
    });

    it('should reveal content immediately', () => {
      const fixture = TestBed.createComponent(RevealHostComponent);
      fixture.detectChanges();
      readItems(fixture);
      expect(items.every((item) => item.classList.contains('is-visible'))).toBeTrue();
    });
  });
});