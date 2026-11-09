import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MagneticDirective } from '../../../motion/magnetic.directive';
import { ScrollProgressDirective } from '../../../motion/scroll-progress.directive';
import { HeadlineComponent } from '../../public/headline/headline.component';
import { headlines } from '../../../content/headlines';

/** Heading of the home hero (`content/headlines.ts`), with one part inside a tape. */
export const HERO_TITLE = headlines.hero.title;

/**
 * Hero of the home. Applied as an attribute on the home `<section>` so the section stays a
 * direct child of the layout.
 *
 * - Left-aligned display h1 with a tape on one word; brand, h1, subtitle and CTAs rise in
 *   sequence (under 1.2 s) and the tape settles like a stamp.
 * - On desktop without reduced motion, the content drifts and fades while the hero leaves
 *   (`[appScrollProgress]="'exit'"`, desktop only).
 * - The main CTA follows the pointer slightly (`[appMagnetic]`).
 */
@Component({
  selector: 'section[app-home-hero]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MagneticDirective, ScrollProgressDirective, HeadlineComponent],
  templateUrl: './home-hero.component.html',
  styleUrls: ['./home-hero.component.scss']
})
export class HomeHeroComponent {
  readonly headline = headlines.hero;
}
