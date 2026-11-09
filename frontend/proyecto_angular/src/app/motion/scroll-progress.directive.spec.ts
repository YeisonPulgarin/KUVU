import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollProgressDirective } from './scroll-progress.directive';
import { ScrollMotionService, ScrollTarget } from './scroll-motion.service';
import { MatchMediaStub } from './testing/match-media.stub';

@Component({
  standalone: true,
  imports: [ScrollProgressDirective],
  template: `<section [appScrollProgress]="range()" [desktopOnly]="desktopOnly()" (progressChange)="last = $event"></section>`
})
class HostComponent {
  readonly range = signal<'' | 'exit'>('');
  readonly desktopOnly = signal(false);
  last = -1;
}

describe('ScrollProgressDirective', () => {
  let media: MatchMediaStub;
  let register: jasmine.Spy;
  let unregister: jasmine.Spy;
  let section: HTMLElement;

  function create(setup: (host: HostComponent) => void = () => {}): ComponentFixture<HostComponent> {
    const fixture = TestBed.createComponent(HostComponent);
    setup(fixture.componentInstance);
    fixture.detectChanges();
    section = fixture.nativeElement.querySelector('section');
    return fixture;
  }

  function registered(): ScrollTarget {
    return register.calls.mostRecent().args[0];
  }

  beforeEach(() => {
    unregister = jasmine.createSpy('unregister');
    register = jasmine.createSpy('register').and.returnValue(unregister);
    TestBed.configureTestingModule({
      providers: [{ provide: ScrollMotionService, useValue: { register } }]
    });
  });

  afterEach(() => media.restore());

  it('registers the host and publishes --p from the loop', () => {
    media = new MatchMediaStub({ reducedMotion: false }).install();
    const fixture = create();
    expect(register).toHaveBeenCalledTimes(1);
    expect(registered().element).toBe(section);
    expect(registered().range).toBe('cover');

    registered().write(0.25);
    expect(section.style.getPropertyValue('--p')).toBe('0.2500');
    expect(fixture.componentInstance.last).toBe(0.25);
  });

  it('passes the range given as the attribute value', () => {
    media = new MatchMediaStub({ reducedMotion: false }).install();
    create((host) => host.range.set('exit'));
    expect(registered().range).toBe('exit');
  });

  it('registers nothing with reduced motion', () => {
    media = new MatchMediaStub({ reducedMotion: true }).install();
    create();
    expect(register).not.toHaveBeenCalled();
  });

  it('with desktopOnly registers nothing below 1024 px', () => {
    media = new MatchMediaStub({ reducedMotion: false, desktop: false }).install();
    create((host) => host.desktopOnly.set(true));
    expect(register).not.toHaveBeenCalled();
  });

  it('with desktopOnly unregisters and clears --p when the viewport drops below 1024 px', () => {
    media = new MatchMediaStub({ reducedMotion: false, desktop: true }).install();
    create((host) => host.desktopOnly.set(true));
    registered().write(0.8);

    media.set('desktop', false);
    expect(unregister).toHaveBeenCalledTimes(1);
    expect(section.style.getPropertyValue('--p')).toBe('');

    media.set('desktop', true);
    expect(register).toHaveBeenCalledTimes(2);
  });

  it('unregisters when the user turns on reduced motion', () => {
    media = new MatchMediaStub({ reducedMotion: false }).install();
    create();
    media.set('reducedMotion', true);
    expect(unregister).toHaveBeenCalledTimes(1);
  });

  it('unregisters and stops listening on destroy', () => {
    media = new MatchMediaStub({ reducedMotion: false }).install();
    const fixture = create();
    fixture.destroy();
    expect(unregister).toHaveBeenCalledTimes(1);
    expect(media.listenerCount('desktop')).toBe(0);
    expect(media.listenerCount('reducedMotion')).toBe(0);
  });
});
