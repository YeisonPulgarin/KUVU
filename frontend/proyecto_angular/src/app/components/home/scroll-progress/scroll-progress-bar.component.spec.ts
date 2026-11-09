import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollProgressBarComponent } from './scroll-progress-bar.component';

@Component({
  standalone: true,
  imports: [ScrollProgressBarComponent],
  template: `<div class="page"><app-scroll-progress /></div>`
})
class HostComponent {}

describe('ScrollProgressBarComponent', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return {
      page: root.querySelector('.page') as HTMLElement,
      host: root.querySelector('app-scroll-progress') as HTMLElement,
      bar: root.querySelector('.bar') as HTMLElement
    };
  }

  const scaleX = (el: HTMLElement) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a;

  it('is decorative: hidden from assistive technology, not focusable, transparent to clicks', () => {
    const { host } = render();
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('[tabindex], a, button')).toBeNull();
    expect(getComputedStyle(host).pointerEvents).toBe('none');
    expect(getComputedStyle(host).position).toBe('fixed');
  });

  it('is empty without progress and follows --page-progress from an ancestor', () => {
    const { page, bar } = render();
    expect(scaleX(bar)).toBe(0);

    page.style.setProperty('--page-progress', '0.5');
    expect(scaleX(bar)).toBeCloseTo(0.5, 5);

    page.style.setProperty('--page-progress', '1');
    expect(scaleX(bar)).toBeCloseTo(1, 5);
  });
});
