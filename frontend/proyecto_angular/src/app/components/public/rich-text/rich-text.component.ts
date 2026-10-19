import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { placeholderLabel, responsible } from '../../../content/responsible';
import type { RichSegment, RichText } from '../../../content/types';

interface RenderedSegment {
  readonly kind: 'text' | 'value' | 'placeholder' | 'link';
  readonly text: string;
  readonly link?: string;
  readonly fragment?: string;
}

function render(segment: RichSegment): RenderedSegment {
  if (typeof segment === 'string') {
    return { kind: 'text', text: segment };
  }
  if ('field' in segment) {
    const value = responsible[segment.field];
    return value === null
      ? { kind: 'placeholder', text: `[${placeholderLabel[segment.field]}]` }
      : { kind: 'value', text: value };
  }
  return { kind: 'link', text: segment.label, link: segment.link, fragment: segment.fragment };
}

/**
 * Renders a `RichText` inline: plain text, responsible-party values (or a visible
 * `<mark>` placeholder while pending) and internal links. Everything is interpolated, never
 * bound as HTML.
 */
@Component({
  selector: 'app-rich-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
  template: `@for (segment of segments(); track $index) {@switch (segment.kind) {@case ('placeholder') {<mark class="placeholder">{{ segment.text }}</mark>}@case ('link') {<a class="rich-link" [routerLink]="segment.link" [fragment]="segment.fragment">{{ segment.text }}</a>}@default {<ng-container>{{ segment.text }}</ng-container>}}}`,
  styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent {
  readonly text = input.required<RichText>();
  readonly segments = computed(() => this.text().map(render));
}
