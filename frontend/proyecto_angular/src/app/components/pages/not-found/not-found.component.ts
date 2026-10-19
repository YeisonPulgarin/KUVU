import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicPageComponent } from '../../public/public-page/public-page.component';
import { PageMetaService } from '../../../services/page-meta.service';
import { pageMeta } from '../../../content/pages';
import { siteNavLinks } from '../../../content/site';

/** Public 404: any URL without a route lands here instead of redirecting to /login. */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, PublicPageComponent],
  template: `
    <app-public-page
      pageTitle="Página no encontrada"
      lead="La dirección que buscas no existe o ya no está disponible."
    >
      <section class="section">
        <div class="container not-found">
          <p class="not-found-code" aria-hidden="true">404</p>
          <a routerLink="/" class="btn-home link-arrow">
            Volver al inicio <span class="link-arrow-icon" aria-hidden="true">→</span>
          </a>
          <nav class="not-found-links" aria-label="Páginas del sitio">
            <ul>
              @for (link of links; track link.href) {
                <li><a [routerLink]="link.href">{{ link.label }}</a></li>
              }
            </ul>
          </nav>
        </div>
      </section>
    </app-public-page>
  `,
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  private readonly meta = inject(PageMetaService);
  readonly links = siteNavLinks.filter((link) => link.href !== '/');

  ngOnInit(): void {
    this.meta.setPage(pageMeta.notFound);
  }
}
