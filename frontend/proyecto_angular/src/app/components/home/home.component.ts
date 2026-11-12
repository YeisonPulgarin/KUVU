import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteHeaderComponent } from '../public/site-header/site-header.component';
import { SiteFooterComponent } from '../public/site-footer/site-footer.component';
import { ServiceIconComponent } from '../public/service-icon/service-icon.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { TeamBandComponent } from './team-band/team-band.component';
import { ScrollProgressBarComponent } from './scroll-progress/scroll-progress-bar.component';
import { HomeHeroComponent } from './hero/home-hero.component';
import { StepsJourneyComponent } from './steps-journey/steps-journey.component';
import { CompaniesMarqueeComponent } from './companies-marquee/companies-marquee.component';
import { MagneticDirective } from '../../motion/magnetic.directive';
import { ScrollMotionService } from '../../motion/scroll-motion.service';
import { ScrollProgressDirective } from '../../motion/scroll-progress.directive';
import { SplitTextComponent } from '../../motion/split-text.component';
import { HeadlineComponent } from '../public/headline/headline.component';
import { PageMetaService } from '../../services/page-meta.service';
import { SectionSpyService } from '../public/site-header/section-spy.service';
import {
  headlines,
  homeFaqItems,
  homeSpySections,
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
    TeamBandComponent,
    ScrollProgressBarComponent,
    HomeHeroComponent,
    StepsJourneyComponent,
    CompaniesMarqueeComponent,
    MagneticDirective,
    ScrollProgressDirective,
    SplitTextComponent,
    HeadlineComponent
  ],
  // Scroll-linked motion lives only while the home does: leaving it destroys the service and
  // releases its listeners, observer and pending frame.
  providers: [ScrollMotionService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly meta = inject(PageMetaService);
  private readonly scroll = inject(ScrollMotionService);
  private readonly spy = inject(SectionSpyService);
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly services = services;
  readonly securityHighlights = securityHighlights;
  readonly origin = origin;
  readonly homeFaqItems = homeFaqItems;
  readonly titles = headlines;

  ngOnInit(): void {
    this.meta.setPage(pageMeta.home);
    const url = this.meta.absolute('/');
    // Only data the site actually has: the fictitious company has no address to publish.
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

  constructor() {
    // The scroll-spy starts after the first render, once the sections exist; it drives the
    // menu highlight and the trail in the site header. Destroying the home cancels the hook.
    afterNextRender(() => this.spy.start(homeSpySections));
  }

  /** The reading-progress bar reads `--page-progress` from the home host. */
  ngAfterViewInit(): void {
    this.scroll.setPageProgressHost(this.host);
  }

  ngOnDestroy(): void {
    this.meta.clearJsonLd(HOME_JSONLD_ID);
    this.spy.stop();
  }
}
