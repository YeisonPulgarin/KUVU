import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteHeaderComponent } from '../public/site-header/site-header.component';
import { SiteFooterComponent } from '../public/site-footer/site-footer.component';
import { ServiceIconComponent } from '../public/service-icon/service-icon.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { TeamBandComponent } from './team-band/team-band.component';
import { PageMetaService } from '../../services/page-meta.service';
import {
  companies,
  homeFaqItems,
  howItWorks,
  logo,
  origin,
  pageMeta,
  securityHighlights,
  services,
  siteInfo
} from '../../content';

/** Id of the home `<script type="application/ld+json">` (Organization + WebSite). */
export const HOME_JSONLD_ID = 'kuvu-home-jsonld';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SiteHeaderComponent,
    SiteFooterComponent,
    ServiceIconComponent,
    RevealDirective,
    TeamBandComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly meta = inject(PageMetaService);

  readonly services = services;
  readonly companies = companies;
  readonly howItWorks = howItWorks;
  readonly securityHighlights = securityHighlights;
  readonly origin = origin;
  readonly homeFaqItems = homeFaqItems;

  ngOnInit(): void {
    this.meta.setPage(pageMeta.home);
    const url = this.meta.absolute('/');
    // Only data the site actually has: no phone or address while they are placeholders.
    this.meta.setJsonLd(HOME_JSONLD_ID, {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${url}#organization`,
          name: siteInfo.name,
          url,
          logo: this.meta.absolute(logo.web)
        },
        {
          '@type': 'WebSite',
          '@id': `${url}#website`,
          name: siteInfo.name,
          url,
          inLanguage: 'es-CO',
          publisher: { '@id': `${url}#organization` }
        }
      ]
    });
  }

  ngOnDestroy(): void {
    this.meta.clearJsonLd(HOME_JSONLD_ID);
  }
}
