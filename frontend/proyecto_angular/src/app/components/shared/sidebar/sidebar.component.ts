import { Component, inject, computed, signal, DestroyRef, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';
import { ConfirmService } from '../confirm/confirm.service';
import { TAP_FEEDBACK_MS } from '../../../motion/tap-feedback';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss', './sidebar-feedback.scss']
})
export class SidebarComponent {
  auth      = inject(AuthService);
  router    = inject(Router);
  sidebarSvc = inject(SidebarService);
  destroyRef = inject(DestroyRef);
  platformId = inject(PLATFORM_ID);
  private confirm = inject(ConfirmService);

  colapsado = this.sidebarSvc.colapsado;
  empresa   = this.auth.empresaActiva;
  usuario   = this.auth.usuarioActivo;
  esAdmin   = computed(() => this.auth.usuarioActivo()?.idRol === 1);

  inicialEmpresa = computed(() => (this.empresa()?.nombre ?? 'A').charAt(0).toUpperCase());
  inicialUsuario = computed(() => (this.usuario()?.nombre ?? 'U').charAt(0).toUpperCase());

  mostrarTexto = computed(() => !this.colapsado() || this.esMobile());

  menuAbierto = signal(false);
  esMobile    = signal(false);

  /** Link just chosen in the mobile drawer: keeps its "chosen" look until the drawer closes. */
  elegido = signal<string | null>(null);
  private cierrePendiente: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const mq = window.matchMedia('(max-width: 767px)');
      this.esMobile.set(mq.matches);
      const onViewportChange = (e: MediaQueryListEvent) => this.esMobile.set(e.matches);
      mq.addEventListener('change', onViewportChange);
      this.destroyRef.onDestroy(() => mq.removeEventListener('change', onViewportChange));

      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => {
          // A chosen link already scheduled the close: let its feedback finish.
          if (this.esMobile() && this.cierrePendiente === undefined) this.menuAbierto.set(false);
        });
    }
    this.destroyRef.onDestroy(() => clearTimeout(this.cierrePendiente));
  }

  toggle() { this.sidebarSvc.toggle(); }
  abrirMenu() { this.menuAbierto.set(true); }
  cerrarMenu() {
    clearTimeout(this.cierrePendiente);
    this.cierrePendiente = undefined;
    this.elegido.set(null);
    this.menuAbierto.set(false);
  }

  /**
   * A navigation link was chosen. On mobile the router navigates right away, the link keeps
   * its "chosen" state and the drawer closes after TAP_FEEDBACK_MS. On desktop the sidebar
   * stays, so there is nothing to wait for.
   */
  elegir(ruta: string): void {
    if (!this.esMobile() || !this.menuAbierto()) return;
    clearTimeout(this.cierrePendiente);
    this.elegido.set(ruta);
    this.cierrePendiente = setTimeout(() => this.cerrarMenu(), TAP_FEEDBACK_MS);
  }

  /** Asks first: the button sits next to the collapse toggle and is easy to hit by mistake. */
  async logout(): Promise<void> {
    const confirmado = await this.confirm.confirmar({
      titulo: 'Cerrar sesión',
      mensaje: '¿Quieres cerrar tu sesión? Tendrás que ingresar de nuevo para volver.',
      confirmarTexto: 'Cerrar sesión',
      variante: 'neutral'
    });
    if (!confirmado) return;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
