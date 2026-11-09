import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MagneticDirective } from '../../../motion/magnetic.directive';
import { ScrollProgressDirective } from '../../../motion/scroll-progress.directive';
import { SplitTextComponent } from '../../../motion/split-text.component';

/** Heading of the home hero, split into words by `<app-split-text>`. */
export const HERO_TITLE = 'Administración inmobiliaria para empresas que crecen';

/**
 * Hero of the home. Applied as an attribute on the home `<section>` so the section stays a
 * direct child of the layout.
 *
 * - The h1 enters word by word; brand, subtitle and CTAs fade up after it (under 1.5 s).
 * - A decorative scroll cue pulses three times and fades out as the scroll starts.
 * - On desktop without reduced motion, the content drifts and fades while the hero leaves
 *   (`[appScrollProgress]="'exit'"`, desktop only).
 * - The main CTA follows the pointer slightly (`[appMagnetic]`).
 */
@Component({
  selector: 'section[app-home-hero]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MagneticDirective, ScrollProgressDirective, SplitTextComponent],
  templateUrl: './home-hero.component.html',
  styleUrls: ['./home-hero.component.scss']
})
export class HomeHeroComponent {
  readonly title = HERO_TITLE;
}
