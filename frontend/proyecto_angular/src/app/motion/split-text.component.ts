import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SplitTextMode = 'enter' | 'scrub';

/**
 * `<app-split-text>`: splits a text into words that can be animated one by one, keeping the
 * full text once for screen readers (`sr-only` copy) and hiding the visual words
 * (`aria-hidden`). Each word gets its index as `--i` and the host the word count as `--n`.
 *
 * - `enter`: each word rises from a mask with a staggered delay (hero heading).
 * - `scrub`: each word's opacity follows `--p`, published on an ancestor by
 *   `[appScrollProgress]`; without `--p` the words stay fully opaque.
 *
 * Every motion rule lives inside `prefers-reduced-motion: no-preference`: with reduced motion
 * the words are static and fully visible.
 */
@Component({
  selector: 'app-split-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-mode]': 'mode()',
    '[style.--n]': 'words().length'
  },
  template: `<span class="split-sr">{{ text() }}</span><span class="split" aria-hidden="true">@for (word of words(); track $index) {<span class="w" [style.--i]="$index"><span class="w-in">{{ word }}</span></span>@if (!$last) {{{ ' ' }}}}</span>`,
  styles: `
    :host {
      --dim: 0.35;
    }

    .split-sr {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .w,
    .w-in {
      display: inline-block;
    }

    @media (prefers-reduced-motion: no-preference) {
      :host([data-mode='enter']) .w {
        overflow: clip;
        vertical-align: top;
        /* Room for descenders inside the mask without moving the line box. */
        padding-bottom: 0.12em;
        margin-bottom: -0.12em;
      }

      :host([data-mode='enter']) .w-in {
        animation: split-rise var(--dur-slow) var(--ease-out-expo) both;
        animation-delay: calc(var(--i) * 60ms);
      }

      :host([data-mode='scrub']) .w {
        opacity: clamp(var(--dim), calc(var(--p, 1) * (var(--n) + 4) - var(--i)), 1);
      }
    }

    @keyframes split-rise {
      from {
        transform: translateY(100%);
      }
    }
  `
})
export class SplitTextComponent {
  readonly text = input.required<string>();
  readonly mode = input<SplitTextMode>('enter');

  readonly words = computed(() => this.text().trim().split(/\s+/).filter(Boolean));
}
