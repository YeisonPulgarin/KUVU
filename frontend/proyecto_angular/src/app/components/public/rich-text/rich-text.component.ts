import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { resolveRichText } from '../../../content/responsible';
import type { RichText } from '../../../content/types';

/**
 * Renders a `RichText` inline: plain text, responsible-party values (absent ones are left
 * out with their surrounding phrase) and internal links. Everything is interpolated, never
 * bound as HTML.
 */
@Component({
  selector: 'app-rich-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
  template: `@for (segment of segments(); track $index) {@if (segment.kind === 'link') {<a class="rich-link" [routerLink]="segment.link" [fragment]="segment.fragment">{{ segment.text }}</a>} @else {<ng-container>{{ segment.text }}</ng-container>}}`,
  styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent {
  readonly text = input.required<RichText>();
  readonly segments = computed(() => resolveRichText(this.text()));
}
