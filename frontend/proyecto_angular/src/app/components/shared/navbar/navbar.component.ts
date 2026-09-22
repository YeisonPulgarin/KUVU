import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  auth   = inject(AuthService);
  router = inject(Router);

  menuAbierto = false;
  empresa     = this.auth.empresaActiva;
  usuario     = this.auth.usuarioActivo;

  // true si el usuario es Administrador
  esAdmin = computed(() => this.auth.usuarioActivo()?.idRol === 1);

  toggleMenu() { this.menuAbierto = !this.menuAbierto; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
