import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, MENSAJE_ACCESO } from '../../services/auth.service';
import { Empresa } from '../../models/empresa.model';
import { loginBackgroundUrl } from './login-background';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  auth   = inject(AuthService);
  router = inject(Router);

  empresaSeleccionada = signal<Empresa | null>(null);
  correo    = signal('');
  documento = signal('');
  password  = signal('');
  verPassword = signal(false);
  error     = signal('');
  cargando  = signal(false);
  // "Recordarme" es decorativo: no persiste nada (decisión de producto).
  recordarme = signal(false);
  // "¿Olvidaste tu contraseña?" despliega cómo recuperarla: la restablece el administrador.
  ayudaOlvido = signal(false);

  bgUrl = computed(() => loginBackgroundUrl(this.empresaSeleccionada()?.subdominio));

  ngOnInit(): void {
    // Si ya está autenticado, ir al dashboard
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Leer empresa preseleccionada desde el landing
    const raw = sessionStorage.getItem('empresaPreseleccionada');
    if (raw) {
      try {
        const empresa: Empresa = JSON.parse(raw);
        this.empresaSeleccionada.set(empresa);
        sessionStorage.removeItem('empresaPreseleccionada');
      } catch {
        // JSON inválido → volver a acceder
        this.router.navigate(['/acceder']);
      }
    } else {
      // Si llegaron directo a /login sin seleccionar empresa, redirigir a acceder
      this.router.navigate(['/acceder']);
    }
  }

  // Volver al landing (selección de empresa)
  volverAlLanding(): void {
    this.router.navigate(['/acceder']);
  }

  onLogin(): void {
    if (!this.empresaSeleccionada()) {
      this.router.navigate(['/acceder']);
      return;
    }
    if (!this.correo() || !this.documento() || !this.password()) {
      this.error.set('Ingresa tu correo, número de documento y contraseña.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    const empresa = this.empresaSeleccionada()!;
    this.auth.login(this.correo(), this.documento(), this.password(), empresa.id, empresa)
      .subscribe({
        next: (resp) => {
          this.password.set('');
          this.router.navigate([resp.requiereCambioPassword ? '/cambiar-contrasena' : '/dashboard']);
        },
        error: (err) => {
          this.cargando.set(false);
          this.password.set('');
          if (err.status === 401) {
            this.error.set(MENSAJE_ACCESO);
          } else if (err.status === 400) {
            this.error.set('Ingresa tu correo, número de documento y contraseña.');
          } else {
            this.error.set('Error de conexión. Verifica que el backend esté corriendo.');
          }
        }
      });
  }
}
