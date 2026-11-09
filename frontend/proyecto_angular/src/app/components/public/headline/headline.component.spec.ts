import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HeadlineComponent } from './headline.component';
import { headlines } from '../../../content';
import type { HeadlinePart } from '../../../content/types';

@Component({
  standalone: true,
  imports: [HeadlineComponent],
  template: `<h2 class="display-title"><app-headline [parts]="parts()" [title]="title()" /></h2>`
})
class HostComponent {
  readonly parts = signal<readonly HeadlinePart[] | null>(null);
  readonly title = signal('');
}

describe('HeadlineComponent', () => {
  function render(parts: readonly HeadlinePart[] | null, title = ''): HTMLElement {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.parts.set(parts);
    fixture.componentInstance.title.set(title);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('h2') as HTMLElement;
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  it('renders the full title exactly once, with no aria copies', () => {
    const h2 = render(headlines.ctaFinal.parts, headlines.ctaFinal.title);
    expect(h2.textContent).toBe(headlines.ctaFinal.title);
    expect(h2.querySelectorAll('[aria-label], [aria-hidden]').length).toBe(0);
  });

  it('wraps accent parts in <em> and tape parts in .tape', () => {
    const h2 = render(['Seguridad y ', { text: 'soporte', em: 'accent' }, ' o ', { text: 'cinta', em: 'tape' }]);
    expect(h2.querySelector('em')?.textContent).toBe('soporte');
    expect(h2.querySelector('.tape')?.textContent).toBe('cinta');
    expect(h2.textContent).toBe('Seguridad y soporte o cinta');
  });

  it('falls back to the plain title without parts', () => {
    const h2 = render(null, 'Legal');
    expect(h2.textContent).toBe('Legal');
    expect(h2.querySelector('em, .tape')).toBeNull();
  });
});
