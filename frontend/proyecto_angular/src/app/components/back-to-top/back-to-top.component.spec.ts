import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { BackToTopComponent } from './back-to-top.component';
import { MatchMediaStub } from '../../motion/testing/match-media.stub';

@Component({ standalone: true, template: '' })
class BlankPage {}

describe('BackToTopComponent', () => {
  let fixture: ComponentFixture<BackToTopComponent>;
  let media: MatchMediaStub;
  let scrollY = 0;
  const extras: HTMLElement[] = [];

  const button = () => fixture.nativeElement.querySelector('button.back-to-top') as HTMLButtonElement;

  /** A scroll container with a known viewport (200px) and a tall child. */
  const container = (className: string): HTMLElement => {
    const el = document.createElement('div');
    el.className = className;
    el.style.cssText = 'height:200px;overflow-y:auto;';
    el.innerHTML = '<div style="height:2000px"></div>';
    document.body.appendChild(el);
    extras.push(el);
    return el;
  };

  const scrollTo = (el: HTMLElement, top: number) => {
    el.scrollTop = top;
    el.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  };

  const scrollWindow = (y: number) => {
    scrollY = y;
    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    media = new MatchMediaStub({ reducedMotion: false }).install();
    scrollY = 0;
    spyOnProperty(window, 'scrollY').and.callFake(() => scrollY);

    await TestBed.configureTestingModule({
      imports: [BackToTopComponent],
      providers: [provideRouter([{ path: 'otra', component: BlankPage }])]
    }).compileComponents();

    fixture = TestBed.createComponent(BackToTopComponent);
    fixture.detectChanges();
    TestBed.tick();
  });

  afterEach(() => {
    fixture.destroy();
    extras.splice(0).forEach((el) => el.remove());
    media.restore();
  });

  it('is a labelled button with an up-arrow icon, hidden at the top of the page', () => {
    const btn = button();
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.getAttribute('aria-label')).toBe('Volver arriba');
    expect(btn.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
    expect(btn.classList).not.toContain('is-visible');
    expect(btn.getAttribute('aria-hidden')).toBe('true');
    expect(btn.getAttribute('tabindex')).toBe('-1');
    expect(getComputedStyle(btn).visibility).toBe('hidden');
  });

  it('shows once the window scrolls past one viewport and hides again below it', () => {
    scrollWindow(window.innerHeight + 1);
    expect(button().classList).toContain('is-visible');
    expect(button().hasAttribute('aria-hidden')).toBeFalse();
    expect(button().hasAttribute('tabindex')).toBeFalse();

    scrollWindow(window.innerHeight - 1);
    expect(button().classList).not.toContain('is-visible');
  });

  it('follows the signed-in app scroll container (.main-content)', () => {
    const main = container('main-content');
    scrollTo(main, 150);
    expect(button().classList).not.toContain('is-visible');
    scrollTo(main, 201);
    expect(button().classList).toContain('is-visible');
  });

  it('ignores scrolls of other elements (tables, menu panel, dialogs)', () => {
    const other = container('tabla-wrap');
    scrollTo(other, 1500);
    expect(button().classList).not.toContain('is-visible');
  });

  it('scrolls the tracked container to the top smoothly', () => {
    const main = container('main-content');
    scrollTo(main, 600);
    const spy = spyOn(main, 'scrollTo') as jasmine.Spy;
    button().click();
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('scrolls the window when the page scrolls the window', () => {
    scrollWindow(window.innerHeight * 2);
    const spy = spyOn(window, 'scrollTo') as jasmine.Spy;
    button().click();
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('jumps without animation under reduced motion', () => {
    media.set('reducedMotion', true);
    scrollWindow(window.innerHeight * 2);
    const spy = spyOn(window, 'scrollTo') as jasmine.Spy;
    button().click();
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('starts hidden again after navigating to another route', fakeAsync(() => {
    scrollWindow(window.innerHeight * 2);
    expect(button().classList).toContain('is-visible');
    TestBed.inject(Router).navigateByUrl('/otra');
    tick();
    fixture.detectChanges();
    expect(button().classList).not.toContain('is-visible');
  }));

  it('stops listening once destroyed', () => {
    const instance = fixture.componentInstance;
    fixture.destroy();
    scrollY = window.innerHeight * 3;
    document.dispatchEvent(new Event('scroll'));
    expect(instance.visible()).toBeFalse();
  });

  it('sits below the mobile menu, sidebar and toasts', () => {
    const z = Number(getComputedStyle(button()).zIndex);
    expect(z).toBeLessThan(50);
    expect(z).toBeGreaterThan(0);
  });
});
