import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteHeaderComponent } from '../../public/site-header/site-header.component';
import { SiteFooterComponent } from '../../public/site-footer/site-footer.component';
import { RevealDirective } from '../../../directives/reveal.directive';
import { PageMetaService } from '../../../services/page-meta.service';
import { aboutOrigin, aboutSections } from '../../../content';
import { contactWhatsAppLink, pageNavLinks, siteInfo } from '../../../content/site';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SiteHeaderComponent,
    SiteFooterComponent,
    RevealDirective
  ],
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.scss']
})
export class NosotrosComponent implements OnInit {
  readonly pageMeta = inject(PageMetaService);
  readonly brandName = siteInfo.name;
  readonly navLinks = pageNavLinks;
  readonly sections = aboutSections;
  readonly origin = aboutOrigin;
  readonly whatsappLink = contactWhatsAppLink;

  ngOnInit(): void {
    this.pageMeta.setPage(
      'Nosotros | KUVU',
      'Conocé quién es KUVU, cómo opera, con quién trabaja y el origen del proyecto.'
    );
  }
}