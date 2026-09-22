import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Empresa } from '../../models/empresa.model';

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
  error     = signal('');
  cargando  = signal(false);
  // Decisión del usuario: "Recordarme" y "¿Olvidaste tu contraseña?" son
  // decorativos no funcionales — no persisten ni disparan ninguna acción.
  recordarme = signal(false);

  // Mapa de subdominio → nombre de archivo en /login-backgrounds/
  private readonly BG_MAP: Record<string, string> = {
    'kuvu':        'kuvu.webp',
    'amarilo':     'amarilo.webp',
    'balcones':    'balcones.webp',
    'miinmueble':  'miinmueble.webp',
    'nido':        'nido-rent.webp',
  };

  bgUrl = computed(() => {
    const sub = this.empresaSeleccionada()?.subdominio ?? '';
    const file = this.BG_MAP[sub.toLowerCase()] ?? 'kuvu.webp';
    return `/login-backgrounds/${file}`;
  });

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
    if (!this.correo() || !this.documento()) {
      this.error.set('Ingresa tu correo y número de documento.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.auth.login(this.correo(), this.documento(), this.empresaSeleccionada()!.id)
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.cargando.set(false);
          if (err.status === 401) {
            this.error.set('Correo o documento incorrecto para esta empresa.');
          } else {
            this.error.set('Error de conexión. Verifica que el backend esté corriendo.');
          }
        }
      });
  }
}
