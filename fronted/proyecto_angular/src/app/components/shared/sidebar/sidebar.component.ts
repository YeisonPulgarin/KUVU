import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  auth    = inject(AuthService);
  router  = inject(Router);
  sidebarSvc = inject(SidebarService);

  colapsado = this.sidebarSvc.colapsado;
  empresa   = this.auth.empresaActiva;
  usuario   = this.auth.usuarioActivo;
  esAdmin   = computed(() => this.auth.usuarioActivo()?.idRol === 1);

  inicialEmpresa = computed(() => (this.empresa()?.nombre ?? 'A').charAt(0).toUpperCase());
  inicialUsuario = computed(() => (this.usuario()?.nombre ?? 'U').charAt(0).toUpperCase());

  toggle() { this.sidebarSvc.toggle(); }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
