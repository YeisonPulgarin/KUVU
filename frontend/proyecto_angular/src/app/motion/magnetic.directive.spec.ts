import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAGNETIC_MAX_PX, MagneticDirective } from './magnetic.directive';
import { AnimationFrameStub } from './testing/animation-frame.stub';
import { MatchMediaStub } from './testing/match-media.stub';

@Component({
  standalone: true,
  imports: [MagneticDirective],
  template: `<a href="#" appMagnetic>Empezar</a>`
})
class HostComponent {}

describe('MagneticDirective', () => {
  let media: MatchMediaStub;
  let frames: AnimationFrameStub;
  let add: jasmine.Spy;
  let button: HTMLElement;

  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('a');
    spyOn(button, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0, width: 100, height: 40 } as DOMRect);
    return fixture;
  }

  function pointerListeners(): number {
    return add.calls.allArgs().filter(([type]) => type === 'pointermove').length;
  }

  function move(clientX: number, clientY: number): void {
    button.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
    frames.flush();
  }

  beforeEach(() => {
    frames = new AnimationFrameStub();
    add = spyOn(HTMLElement.prototype, 'addEventListener').and.callThrough();
  });

  afterEach(() => media.restore());

  it('adds the magnetic class to the host', () => {
    media = new MatchMediaStub({ finePointer: true, reducedMotion: false }).install();
    render();
    expect(button.classList).toContain('magnetic');
  });

  it('registers no listener with a coarse pointer', () => {
    media = new MatchMediaStub({ finePointer: false, reducedMotion: false }).install();
    render();
    expect(pointerListeners()).toBe(0);
  });

  it('registers no listener with reduced motion', () => {
    media = new MatchMediaStub({ finePointer: true, reducedMotion: true }).install();
    render();
    expect(pointerListeners()).toBe(0);
  });

  it('follows a quarter of the distance to the centre', () => {
    media = new MatchMediaStub({ finePointer: true, reducedMotion: false }).install();
    render();
    move(58, 16); // centre is (50, 20)
    expect(button.style.getPropertyValue('--mx')).toBe('2.00px');
    expect(button.style.getPropertyValue('--my')).toBe('-1.00px');
  });

  it('never moves more than 6 px in any direction', () => {
    media = new MatchMediaStub({ finePointer: true, reducedMotion: false }).install();
    render();
    move(1000, -1000);
    expect(button.style.getPropertyValue('--mx')).toBe(`${MAGNETIC_MAX_PX.toFixed(2)}px`);
    expect(button.style.getPropertyValue('--my')).toBe(`-${MAGNETIC_MAX_PX.toFixed(2)}px`);
  });

  it('updates at most once per frame', () => {
    media = new MatchMediaStub({ finePointer: true, reducedMotion: false }).install();
    render();
    frames.request.calls.reset();
    for (let x = 50; x < 60; x++) {
      button.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: 20 }));
    }
    expect(frames.request).toHaveBeenCalledTimes(1);
  });

  it('goes back to 0 when the pointer leaves', () => {
    media = new MatchMediaStub({ finePointer: true, reducedMotion: false }).install();
    render();
    move(90, 30);
    button.dispatchEvent(new PointerEvent('pointerleave'));
    expect(button.style.getPropertyValue('--mx')).toBe('0.00px');
    expect(button.style.getPropertyValue('--my')).toBe('0.00px');
  });

  it('removes its listeners and variables when the pointer stops being fine', () => {
    media = new MatchMediaStub({ finePointer: true, reducedMotion: false }).install();
    render();
    const remove = spyOn(button, 'removeEventListener').and.callThrough();
    move(90, 30);

    media.set('finePointer', false);
    expect(remove).toHaveBeenCalledWith('pointermove', jasmine.any(Function));
    expect(remove).toHaveBeenCalledWith('pointerleave', jasmine.any(Function));
    expect(button.style.getPropertyValue('--mx')).toBe('');

    move(1000, 1000);
    expect(button.style.getPropertyValue('--mx')).toBe('');
  });

  it('stops listening to preference changes on destroy', () => {
    media = new MatchMediaStub({ finePointer: true, reducedMotion: false }).install();
    const fixture = render();
    fixture.destroy();
    expect(media.listenerCount('finePointer')).toBe(0);
    expect(media.listenerCount('reducedMotion')).toBe(0);
  });
});
