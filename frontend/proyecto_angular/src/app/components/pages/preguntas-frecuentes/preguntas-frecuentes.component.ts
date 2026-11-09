import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicPageComponent } from '../../public/public-page/public-page.component';
import { RevealDirective } from '../../../directives/reveal.directive';
import { PageMetaService } from '../../../services/page-meta.service';
import { pageMeta as metaByPage } from '../../../content/pages';
import { faqGroups, headlines } from '../../../content';
import { breadcrumbFor } from '../../../content/site';

@Component({
  selector: 'app-preguntas-frecuentes',
  standalone: true,
  imports: [RouterModule, PublicPageComponent, RevealDirective],
  templateUrl: './preguntas-frecuentes.component.html',
  styleUrls: ['./preguntas-frecuentes.component.scss']
})
export class PreguntasFrecuentesComponent implements OnInit {
  readonly pageMeta = inject(PageMetaService);
  readonly breadcrumb = breadcrumbFor('/preguntas-frecuentes');
  readonly groups = faqGroups;
  readonly headline = headlines.faq;

  ngOnInit(): void {
    this.pageMeta.setPage(metaByPage.preguntasFrecuentes);
  }
}
