import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiteHeaderComponent } from '../site-header/site-header.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { HeadlineComponent } from '../headline/headline.component';
import type { HeadlinePart, NavItem } from '../../../content/types';

/**
 * Shared shell of the internal public pages: header, page hero (breadcrumb, display title and
 * lead), the projected page content and the footer. The root carries `.site-root` (fluid body
 * size and grained background), so every internal page, legal and 404 included, inherits it.
 * `titleParts` optionally splits the title to emphasize a part (see `content/headlines.ts`).
 */
@Component({
  selector: 'app-public-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeaderComponent, SiteFooterComponent, BreadcrumbComponent, HeadlineComponent],
  templateUrl: './public-page.component.html',
  styleUrls: ['./public-page.component.scss']
})
export class PublicPageComponent {
  readonly pageTitle = input.required<string>();
  readonly titleParts = input<readonly HeadlinePart[]>();
  readonly lead = input<string>();
  readonly breadcrumb = input<readonly NavItem[]>();
}
