import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SplitTextComponent, SplitTextMode } from './split-text.component';

@Component({
  standalone: true,
  imports: [SplitTextComponent],
  template: `<h1><app-split-text [text]="text()" [mode]="mode()" /></h1>`
})
class HostComponent {
  readonly text = signal('Arrienda tu local   comercial sin vueltas');
  readonly mode = signal<SplitTextMode>('enter');
}

/** Text that assistive technology reaches: everything outside `aria-hidden` subtrees. */
function accessibleText(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
  return clone.textContent?.trim() ?? '';
}

describe('SplitTextComponent', () => {
  function render(setup: (host: HostComponent) => void = () => {}) {
    const fixture = TestBed.createComponent(HostComponent);
    setup(fixture.componentInstance);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    const host = h1.querySelector('app-split-text') as HTMLElement;
    return { fixture, h1, host };
  }

  it('exposes the original text once to screen readers', () => {
    const { h1, fixture } = render();
    expect(accessibleText(h1)).toBe(fixture.componentInstance.text());
  });

  it('hides the animated words from assistive technology', () => {
    const { host } = render();
    const split = host.querySelector('.split') as HTMLElement;
    expect(split.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders one element per word with its index as --i and the count as --n', () => {
    const { host } = render();
    const words = Array.from(host.querySelectorAll<HTMLElement>('.w'));
    expect(words.map((w) => w.textContent)).toEqual(['Arrienda', 'tu', 'local', 'comercial', 'sin', 'vueltas']);
    expect(words.map((w) => w.style.getPropertyValue('--i'))).toEqual(['0', '1', '2', '3', '4', '5']);
    expect(host.style.getPropertyValue('--n')).toBe('6');
  });

  it('keeps the words readable as a sentence (spaces between them)', () => {
    const { host } = render();
    expect(host.querySelector('.split')!.textContent).toBe('Arrienda tu local comercial sin vueltas');
  });

  it('reflects the mode on the host for the styles', () => {
    const { host, fixture } = render();
    expect(host.getAttribute('data-mode')).toBe('enter');
    fixture.componentInstance.mode.set('scrub');
    fixture.detectChanges();
    expect(host.getAttribute('data-mode')).toBe('scrub');
  });

  it('follows text changes', () => {
    const { host, fixture } = render();
    fixture.componentInstance.text.set('Dos palabras');
    fixture.detectChanges();
    expect(host.querySelectorAll('.w').length).toBe(2);
    expect(host.style.getPropertyValue('--n')).toBe('2');
  });
});
