import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiteHeaderComponent } from '../site-header/site-header.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import type { NavItem } from '../../../content/types';

/**
 * Shared shell of the internal public pages: header, page hero (breadcrumb, title and lead),
 * the projected page content and the footer.
 */
@Component({
  selector: 'app-public-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeaderComponent, SiteFooterComponent, BreadcrumbComponent],
  templateUrl: './public-page.component.html',
  styleUrls: ['./public-page.component.scss']
})
export class PublicPageComponent {
  readonly pageTitle = input.required<string>();
  readonly lead = input<string>();
  readonly breadcrumb = input<readonly NavItem[]>();
}
