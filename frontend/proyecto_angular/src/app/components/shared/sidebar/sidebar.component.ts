import { Component, inject, computed, signal, DestroyRef, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  auth      = inject(AuthService);
  router    = inject(Router);
  sidebarSvc = inject(SidebarService);
  destroyRef = inject(DestroyRef);
  platformId = inject(PLATFORM_ID);

  colapsado = this.sidebarSvc.colapsado;
  empresa   = this.auth.empresaActiva;
  usuario   = this.auth.usuarioActivo;
  esAdmin   = computed(() => this.auth.usuarioActivo()?.idRol === 1);

  inicialEmpresa = computed(() => (this.empresa()?.nombre ?? 'A').charAt(0).toUpperCase());
  inicialUsuario = computed(() => (this.usuario()?.nombre ?? 'U').charAt(0).toUpperCase());

  mostrarTexto = computed(() => !this.colapsado() || this.esMobile());

  menuAbierto = signal(false);
  esMobile    = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const mq = window.matchMedia('(max-width: 767px)');
      this.esMobile.set(mq.matches);
      const onViewportChange = (e: MediaQueryListEvent) => this.esMobile.set(e.matches);
      mq.addEventListener('change', onViewportChange);
      this.destroyRef.onDestroy(() => mq.removeEventListener('change', onViewportChange));

      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => { if (this.esMobile()) this.menuAbierto.set(false); });
    }
  }

  toggle() { this.sidebarSvc.toggle(); }
  abrirMenu() { this.menuAbierto.set(true); }
  cerrarMenu() { this.menuAbierto.set(false); }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
