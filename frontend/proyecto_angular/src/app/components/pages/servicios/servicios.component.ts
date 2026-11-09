import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicPageComponent } from '../../public/public-page/public-page.component';
import { ServiceIconComponent } from '../../public/service-icon/service-icon.component';
import { RevealDirective } from '../../../directives/reveal.directive';
import { PageMetaService } from '../../../services/page-meta.service';
import { benefitsByRole, services } from '../../../content';
import { pageMeta } from '../../../content/pages';
import { breadcrumbFor } from '../../../content/site';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [RouterModule, PublicPageComponent, ServiceIconComponent, RevealDirective],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.scss']
})
export class ServiciosComponent implements OnInit {
  private readonly meta = inject(PageMetaService);

  readonly breadcrumb = breadcrumbFor('/servicios');
  readonly services = services;
  readonly benefitsByRole = benefitsByRole;

  ngOnInit(): void {
    this.meta.setPage(pageMeta.servicios);
  }
}
