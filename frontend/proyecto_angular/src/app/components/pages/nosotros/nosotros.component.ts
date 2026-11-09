import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicPageComponent } from '../../public/public-page/public-page.component';
import { RevealDirective } from '../../../directives/reveal.directive';
import { ResponsiveImageComponent } from '../../public/responsive-image/responsive-image.component';
import { PageMetaService } from '../../../services/page-meta.service';
import { pageMeta as metaByPage } from '../../../content/pages';
import { aboutOrigin, aboutSections, team } from '../../../content';
import { breadcrumbFor, contactWhatsAppLink } from '../../../content/site';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [RouterModule, PublicPageComponent, RevealDirective, ResponsiveImageComponent],
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

  ngOnInit(): void {
    this.pageMeta.setPage(metaByPage.nosotros);
  }

  /** Two-digit section number ("01", "02"…). */
  number(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
