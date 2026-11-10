import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { SidebarService } from '../../../services/sidebar.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastHostComponent } from '../toast/toast-host.component';
import { ConfirmHostComponent } from '../confirm/confirm-host.component';
import { ToastService } from '../toast/toast.service';
import { IconComponent } from '../icon/icon.component';

/** Breadcrumb label of the dashboard: there the company is the current place, not a link. */
export const PAGINA_INICIO = 'Inicio';

export const MENSAJE_ERROR_CARGA =
  'No pudimos cargar los datos de la empresa. Revisa tu conexión e intenta de nuevo.';

/**
 * Shell of every signed-in screen: sidebar, main column with the breadcrumb
 * "{Empresa} › {Página}", and the hosts of toasts and confirmations. A failed data load is
 * reported here once per attempt, so no screen has to.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, SidebarComponent, ToastHostComponent, ConfirmHostComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-layout">
      <app-sidebar />
      <main class="main-content" [class.collapsed]="colapsado()">
        <nav class="app-breadcrumb" aria-label="Ruta">
          <ol>
            <li>
              <app-icon name="building" />
              @if (esInicio()) {
                <span>{{ empresa() }}</span>
              } @else {
                <a routerLink="/dashboard">{{ empresa() }}</a>
              }
            </li>
            <li>
              <span class="app-breadcrumb__sep" aria-hidden="true">›</span>
              <span aria-current="page">{{ pagina() }}</span>
            </li>
          </ol>
        </nav>
        <ng-content />
      </main>
      <!-- Inside .app-layout so the app-scoped button styles reach the dialog and toasts. -->
      <app-toast-host />
      <app-confirm-host />
    </div>
  `
})
export class AppLayoutComponent {
  readonly pagina = input.required<string>();

  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  protected readonly colapsado = inject(SidebarService).colapsado;
  protected readonly empresa = computed(() => this.auth.empresaActiva()?.nombre ?? 'Mi empresa');
  protected readonly esInicio = computed(() => this.pagina() === PAGINA_INICIO);

  constructor() {
    effect(() => {
      if (this.data.errorCarga()) untracked(() => this.toast.error(MENSAJE_ERROR_CARGA));
    });
  }
}
