import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { NavItem } from '../../../content/types';
import { PageMetaService } from '../../../services/page-meta.service';

/**
 * Breadcrumb de las páginas públicas internas ("Inicio › Página"). El último ítem es la
 * página actual. Publica el mismo recorrido como JSON-LD `BreadcrumbList` mientras está
 * montado, así el visual y los datos estructurados salen de una sola fuente.
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
  template: `
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <ol class="breadcrumb-list">
        @for (item of items(); track item.href; let first = $first, last = $last) {
          <li class="breadcrumb-item">
            @if (!first) {
              <span class="breadcrumb-separator" aria-hidden="true"> › </span>
            }
            @if (last) {
              <span class="breadcrumb-current" aria-current="page">{{ item.label }}</span>
            } @else {
              <a class="breadcrumb-link" [routerLink]="item.href">{{ item.label }}</a>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  readonly items = input.required<readonly NavItem[]>();
  private readonly pageMeta = inject(PageMetaService);

  ngOnInit(): void {
    this.pageMeta.setBreadcrumb(this.items());
  }

  ngOnDestroy(): void {
    this.pageMeta.clearBreadcrumb();
  }
}
