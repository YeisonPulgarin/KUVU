import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { HeadlinePart } from '../../../content/types';

interface RenderedPart {
  readonly text: string;
  readonly em: 'accent' | 'tape' | null;
}

/**
 * Inline content of a display headline split into parts. It renders inside the caller's
 * `h1`/`h2`: plain parts as text, `accent` as `<em>` and `tape` as a `.tape` span. The text
 * is in the DOM exactly once, so screen readers read the headline as written.
 * Without `parts`, it renders `title`.
 */
@Component({
  selector: 'app-headline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (part of rendered(); track $index) {@switch (part.em) {@case ('accent') {<em>{{ part.text }}</em>}@case ('tape') {<span class="tape">{{ part.text }}</span>}@default {<ng-container>{{ part.text }}</ng-container>}}}`,
  styles: `:host { display: contents; }`
})
export class HeadlineComponent {
  readonly parts = input<readonly HeadlinePart[] | null | undefined>(null);
  readonly title = input<string>('');

  readonly rendered = computed<readonly RenderedPart[]>(() => {
    const parts = this.parts();
    if (!parts?.length) return [{ text: this.title(), em: null }];
    return parts.map((p) => (typeof p === 'string' ? { text: p, em: null } : { text: p.text, em: p.em }));
  });
}
