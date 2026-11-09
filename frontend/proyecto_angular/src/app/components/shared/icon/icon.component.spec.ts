import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ICONOS, IconComponent, IconName } from './icon.component';

@Component({
  standalone: true,
  imports: [IconComponent],
  template: `<app-icon [name]="name()" />`
})
class HostComponent {
  name = signal<IconName>('trash');
}

describe('IconComponent', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the SVG children of the requested icon', () => {
    const fixture = render();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.querySelectorAll('path').length).toBe(4);
    expect(svg.querySelector('path')!.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('is hidden from assistive technology', () => {
    const host = (render().nativeElement as HTMLElement).querySelector('app-icon')!;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('swaps the drawing when the name changes', () => {
    const fixture = render();
    fixture.componentInstance.name.set('check');
    fixture.detectChanges();
    const paths = (fixture.nativeElement as HTMLElement).querySelectorAll('svg path');
    expect(paths.length).toBe(1);
    expect(paths[0].getAttribute('d')).toBe('M20 6 9 17l-5-5');
  });

  it('defines every icon as SVG markup only', () => {
    for (const markup of Object.values(ICONOS)) {
      expect(markup).toMatch(/^<(path|rect|circle) /);
      expect(markup).not.toMatch(/script|on\w+=/i);
    }
  });
});
