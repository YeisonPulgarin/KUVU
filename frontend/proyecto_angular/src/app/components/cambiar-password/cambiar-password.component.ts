import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, MENSAJE_ACCESO } from '../../services/auth.service';
import { ReglaPassword, cumplePolitica, evaluarPassword } from '../../services/password-policy';
import { loginBackgroundUrl } from '../login/login-background';

/**
 * Password change. Two modes:
 * - forced: after a login with a temporary password (no session yet, AuthService.cambioPendiente);
 * - voluntary: an authenticated user changing their own password.
 * A successful change opens the session and goes to the dashboard.
 */
@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cambiar-password.component.html',
  styleUrls: ['../login/login.component.scss', './cambiar-password.component.scss'],
})
export class CambiarPasswordComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  obligatorio = computed(() => this.auth.cambioPendiente() !== null);

  private empresa = computed(() => this.auth.cambioPendiente()?.empresa ?? this.auth.empresaActiva());
  nombreEmpresa = computed(() => this.empresa()?.nombre ?? '');
  bgUrl = computed(() => loginBackgroundUrl(this.empresa()?.subdominio));

  actual       = signal('');
  nueva        = signal('');
  confirmacion = signal('');
  verActual    = signal(false);
  verNueva     = signal(false);
  cargando     = signal(false);
  error        = signal('');
  reglasServidor = signal<ReglaPassword[]>([]);

  private contexto = computed(() => {
    const p = this.auth.cambioPendiente();
    const u = this.auth.usuarioActivo();
    return {
      correo: p?.correo ?? u?.correo ?? '',
      documento: p?.documento ?? u?.documento ?? '',
      actual: this.actual(),
    };
  });

  reglas = computed(() => evaluarPassword(this.nueva(), this.contexto()));
  coincide = computed(() => this.confirmacion().length > 0 && this.confirmacion() === this.nueva());
  puedeEnviar = computed(() =>
    !this.cargando() && this.actual().length > 0 && cumplePolitica(this.nueva(), this.contexto()) && this.coincide()
  );

  onNueva(valor: string): void {
    this.nueva.set(valor);
    this.reglasServidor.set([]);
  }

  guardar(): void {
    if (!this.puedeEnviar()) return;
    this.cargando.set(true);
    this.error.set('');
    this.reglasServidor.set([]);

    this.auth.cambiarPassword(this.actual(), this.nueva()).subscribe({
      next: () => {
        this.limpiar();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 400 && Array.isArray(err.error?.reglas)) {
          this.reglasServidor.set(err.error.reglas);
          this.error.set('La contraseña nueva no cumple la política.');
        } else if (err.status === 401) {
          this.actual.set('');
          this.error.set(MENSAJE_ACCESO);
        } else {
          this.error.set('Error de conexión. Verifica que el backend esté corriendo.');
        }
      },
    });
  }

  volver(): void {
    this.limpiar();
    if (this.obligatorio()) {
      // Leaving the forced change abandons the sign-in (logout ends in /login → /acceder).
      this.auth.logout();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private limpiar(): void {
    this.actual.set('');
    this.nueva.set('');
    this.confirmacion.set('');
  }
}
