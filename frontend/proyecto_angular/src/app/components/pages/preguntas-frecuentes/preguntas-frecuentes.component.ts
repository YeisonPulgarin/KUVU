import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteHeaderComponent } from '../../public/site-header/site-header.component';
import { BreadcrumbComponent } from '../../public/breadcrumb/breadcrumb.component';
import { SiteFooterComponent } from '../../public/site-footer/site-footer.component';
import { RevealDirective } from '../../../directives/reveal.directive';
import { PageMetaService } from '../../../services/page-meta.service';
import { faqGroups } from '../../../content';
import { breadcrumbFor, pageNavLinks } from '../../../content/site';

@Component({
  selector: 'app-preguntas-frecuentes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbComponent,
    SiteHeaderComponent,
    SiteFooterComponent,
    RevealDirective
  ],
  templateUrl: './preguntas-frecuentes.component.html',
  styleUrls: ['./preguntas-frecuentes.component.scss']
})
export class PreguntasFrecuentesComponent implements OnInit {
  readonly pageMeta = inject(PageMetaService);
  readonly breadcrumb = breadcrumbFor('/preguntas-frecuentes');
  readonly groups = faqGroups;
  readonly navLinks = pageNavLinks;

  ngOnInit(): void {
    this.pageMeta.setPage(
      'Preguntas frecuentes | KUVU',
      'Respuestas a las preguntas más frecuentes sobre KUVU: qué es, cómo funciona, cómo se manejan los datos y si hay soporte.'
    );
  }
}