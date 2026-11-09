import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicPageComponent } from '../../public/public-page/public-page.component';
import { RevealDirective } from '../../../directives/reveal.directive';
import { ResponsiveImageComponent } from '../../public/responsive-image/responsive-image.component';
import { PageMetaService } from '../../../services/page-meta.service';
import { pageMeta as metaByPage } from '../../../content/pages';
import { aboutOrigin, aboutSections, headlines, team } from '../../../content';
import { HeadlineComponent } from '../../public/headline/headline.component';
import { breadcrumbFor, contactWhatsAppLink } from '../../../content/site';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [RouterModule, PublicPageComponent, RevealDirective, ResponsiveImageComponent, HeadlineComponent],
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.scss']
})
export class NosotrosComponent implements OnInit {
  readonly pageMeta = inject(PageMetaService);
  readonly breadcrumb = breadcrumbFor('/nosotros');
  readonly sections = aboutSections;
  readonly origin = aboutOrigin;
  readonly team = team;
  readonly whatsappLink = contactWhatsAppLink;
  readonly members = team.members.join(' · ');
  readonly headline = headlines.nosotros;
  readonly teamHeadline = headlines.equipo;
  readonly originHeadline = headlines.origen;

  ngOnInit(): void {
    this.pageMeta.setPage(metaByPage.nosotros);
  }
}
