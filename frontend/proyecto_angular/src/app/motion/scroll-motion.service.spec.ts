import { TestBed } from '@angular/core/testing';
import { ScrollMotionService, ScrollTarget, scrollProgress } from './scroll-motion.service';
import { AnimationFrameStub } from './testing/animation-frame.stub';
import { IntersectionObserverStub } from './testing/intersection-observer.stub';

describe('scrollProgress', () => {
  const viewport = 800;

  it('maps the whole crossing (cover) to 0 → 1', () => {
    expect(scrollProgress({ top: 800, height: 400 }, viewport)).toBe(0);
    expect(scrollProgress({ top: 200, height: 400 }, viewport)).toBe(0.5);
    expect(scrollProgress({ top: -400, height: 400 }, viewport)).toBe(1);
  });

  it('clamps outside the range', () => {
    expect(scrollProgress({ top: 2000, height: 400 }, viewport)).toBe(0);
    expect(scrollProgress({ top: -3000, height: 400 }, viewport)).toBe(1);
  });

  it('maps a leaving element (exit) from the top of the viewport to fully out', () => {
    expect(scrollProgress({ top: 0, height: 800 }, viewport, 'exit')).toBe(0);
    expect(scrollProgress({ top: -400, height: 800 }, viewport, 'exit')).toBe(0.5);
    expect(scrollProgress({ top: -800, height: 800 }, viewport, 'exit')).toBe(1);
  });

  it('maps a tall sticky section (contain) while it fills the viewport', () => {
    expect(scrollProgress({ top: 0, height: 2000 }, viewport, 'contain')).toBe(0);
    expect(scrollProgress({ top: -600, height: 2000 }, viewport, 'contain')).toBe(0.5);
    expect(scrollProgress({ top: -1200, height: 2000 }, viewport, 'contain')).toBe(1);
  });
});

describe('ScrollMotionService', () => {
  let service: ScrollMotionService;
  let frames: AnimationFrameStub;

  function target(top: number, height = 400): ScrollTarget & { write: jasmine.Spy } {
    const element = document.createElement('div');
    spyOn(element, 'getBoundingClientRect').and.returnValue({ top, height } as DOMRect);
    return { element, write: jasmine.createSpy('write') };
  }

  beforeEach(() => {
    IntersectionObserverStub.install();
    frames = new AnimationFrameStub();
    TestBed.configureTestingModule({ providers: [ScrollMotionService] });
    service = TestBed.inject(ScrollMotionService);
  });

  afterEach(() => IntersectionObserverStub.restore());

  it('is not provided in root', () => {
    TestBed.resetTestingModule();
    expect(() => TestBed.inject(ScrollMotionService)).toThrow();
  });

  it('does nothing until the first target registers', () => {
    const add = spyOn(window, 'addEventListener').and.callThrough();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ScrollMotionService] });
    TestBed.inject(ScrollMotionService);
    expect(add).not.toHaveBeenCalledWith('scroll', jasmine.any(Function), jasmine.anything());
    expect(IntersectionObserverStub.instances.length).toBe(0);
  });

  it('writes the progress of a visible target on the next frame', () => {
    const t = target(window.innerHeight / 2, window.innerHeight);
    service.register(t);
    IntersectionObserverStub.instances[0].trigger(t.element, true);
    frames.flush();
    expect(t.write).toHaveBeenCalledOnceWith(scrollProgress({ top: window.innerHeight / 2, height: window.innerHeight }, window.innerHeight));
  });

  it('requests a single frame for a burst of scroll events', () => {
    const t = target(0);
    service.register(t);
    IntersectionObserverStub.instances[0].trigger(t.element, true);
    frames.request.calls.reset();

    frames.flush();
    for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('scroll'));
    expect(frames.request).toHaveBeenCalledTimes(1);
    frames.flush();
    expect(t.write).toHaveBeenCalledTimes(2);
  });

  it('reads every rect before writing any progress', () => {
    const order: string[] = [];
    const a = target(0);
    const b = target(100);
    (a.element.getBoundingClientRect as jasmine.Spy).and.callFake(() => (order.push('read a'), { top: 0, height: 400 }));
    (b.element.getBoundingClientRect as jasmine.Spy).and.callFake(() => (order.push('read b'), { top: 100, height: 400 }));
    a.write.and.callFake(() => order.push('write a'));
    b.write.and.callFake(() => order.push('write b'));
    service.register(a);
    service.register(b);
    const observer = IntersectionObserverStub.instances[0];
    observer.trigger(a.element, true);
    observer.trigger(b.element, true);
    frames.flush();
    expect(order).toEqual(['read a', 'read b', 'write a', 'write b']);
  });

  it('only updates targets that are in view', () => {
    const visible = target(0);
    const hidden = target(5000);
    service.register(visible);
    service.register(hidden);
    const observer = IntersectionObserverStub.instances[0];
    observer.trigger(visible.element, true);
    frames.flush();
    expect(visible.write).toHaveBeenCalled();
    expect(hidden.write).not.toHaveBeenCalled();

    observer.trigger(visible.element, false);
    visible.write.calls.reset();
    window.dispatchEvent(new Event('scroll'));
    frames.flush();
    expect(visible.write).not.toHaveBeenCalled();
  });

  it('stops tracking a target with the function returned by register', () => {
    const t = target(0);
    const stop = service.register(t);
    const observer = IntersectionObserverStub.instances[0];
    observer.trigger(t.element, true);
    stop();
    expect(observer.observed.has(t.element)).toBeFalse();
    frames.flush();
    expect(t.write).not.toHaveBeenCalled();
  });

  it('publishes --page-progress on the page host', () => {
    const host = document.createElement('div');
    service.setPageProgressHost(host);
    frames.flush();
    const value = Number(host.style.getPropertyValue('--page-progress'));
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  it('releases listeners, observer and the pending frame on destroy', () => {
    const remove = spyOn(window, 'removeEventListener').and.callThrough();
    const t = target(0);
    service.register(t);
    const observer = IntersectionObserverStub.instances[0];
    observer.trigger(t.element, true);
    expect(frames.pending).toBe(1);

    service.ngOnDestroy();

    expect(remove).toHaveBeenCalledWith('scroll', jasmine.any(Function));
    expect(remove).toHaveBeenCalledWith('resize', jasmine.any(Function));
    expect(observer.disconnected).toBeTrue();
    expect(frames.cancel).toHaveBeenCalled();
    expect(frames.pending).toBe(0);

    window.dispatchEvent(new Event('scroll'));
    expect(frames.pending).toBe(0);
  });
});
