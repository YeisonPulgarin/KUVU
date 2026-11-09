// ─────────────────────────────────────────────────────────────
//  auth.service.ts  —  Autenticación contra el backend real
// ─────────────────────────────────────────────────────────────
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Empresa } from '../models/empresa.model';
import { Usuario } from '../models/index';

const API = 'http://localhost:3000/api';

export interface LoginExitoso {
  ok: true;
  requiereCambioPassword: false;
  usuario: Usuario;
  empresa: Empresa;
}

export interface LoginCambioRequerido {
  ok: true;
  requiereCambioPassword: true;
}

export type LoginResponse = LoginExitoso | LoginCambioRequerido;

// Same text as the backend's 401: it never says which value failed.
export const MENSAJE_ACCESO =
  'Los datos de acceso no son válidos o la cuenta está bloqueada temporalmente. ' +
  'Revisa e intenta de nuevo en unos minutos.';

export interface CambioPendiente {
  correo: string;
  documento: string;
  empresa_id: number;
  empresa: Empresa | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  // ── Signals de estado ────────────────────────────────────────
  private _empresaActiva    = signal<Empresa | null>(null);
  private _usuarioActivo    = signal<Usuario | null>(null);
  private _isAuthenticated  = signal<boolean>(false);

  empresaActiva   = computed(() => this._empresaActiva());
  usuarioActivo   = computed(() => this._usuarioActivo());
  isAuthenticated = computed(() => this._isAuthenticated());

  // ── Empresas desde BD (se cargan en el login) ────────────────
  private _empresas = signal<Empresa[]>([]);
  empresas          = computed(() => this._empresas());

  // ── Cargar empresas desde el backend ────────────────────────
  cargarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${API}/empresas`).pipe(
      tap(data => this._empresas.set(data))
    );
  }

  // ── Cambio de contraseña pendiente (solo en memoria) ─────────
  // A login with a temporary password does not open a session: it only remembers who has
  // to change it. Never the password, never in storage.
  private _cambioPendiente = signal<CambioPendiente | null>(null);
  cambioPendiente          = computed(() => this._cambioPendiente());

  // ── Login contra el backend (correo + documento + contraseña) ─
  // `empresa` (optional) is the company picked in /acceder; the password change screen uses it
  // for its branding while there is no session yet.
  login(
    correo: string, documento: string, password: string, empresa_id: number, empresa?: Empresa | null
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${API}/auth/login`,
      { correo, documento, password, empresa_id }
    ).pipe(
      tap(resp => {
        if (resp.requiereCambioPassword) {
          this._cambioPendiente.set({
            correo, documento, empresa_id,
            empresa: empresa ?? this._empresas().find(e => e.id === empresa_id) ?? null,
          });
        } else if (resp.ok) {
          this.iniciarSesion(resp, empresa_id);
        }
      })
    );
  }

  // ── Cambiar contraseña (obligatorio tras la temporal, o voluntario con sesión) ──
  cambiarPassword(actual: string, nueva: string): Observable<LoginExitoso> {
    const pendiente = this._cambioPendiente();
    const usuario   = this._usuarioActivo();
    const datos = pendiente
      ? { correo: pendiente.correo, documento: pendiente.documento, empresa_id: pendiente.empresa_id }
      : { correo: usuario?.correo ?? '', documento: usuario?.documento ?? '', empresa_id: usuario?.empresa_id ?? 0 };

    return this.http.post<LoginExitoso>(
      `${API}/auth/cambiar-password`,
      { ...datos, password: actual, passwordNueva: nueva }
    ).pipe(
      tap(resp => {
        this._cambioPendiente.set(null);
        this.iniciarSesion(resp, datos.empresa_id);
      })
    );
  }

  private iniciarSesion(resp: LoginExitoso, empresa_id: number): void {
    // resp.empresa comes from the backend; the cached list is only a fallback.
    const empresa: Empresa | null = resp.empresa ?? this._empresas().find(e => e.id === empresa_id) ?? null;

    this._empresaActiva.set(empresa);
    this._usuarioActivo.set(resp.usuario);
    this._isAuthenticated.set(true);
    this.aplicarTemaEmpresa(empresa);

    // Persistir sesión en localStorage
    localStorage.setItem('empresa_id', String(empresa_id));
    localStorage.setItem('usuario',    JSON.stringify(resp.usuario));
    if (empresa) localStorage.setItem('empresa', JSON.stringify(empresa));
  }

  // ── Logout ───────────────────────────────────────────────────
  logout(): void {
    this._empresaActiva.set(null);
    this._usuarioActivo.set(null);
    this._isAuthenticated.set(false);
    this._cambioPendiente.set(null);
    localStorage.clear();
    this.resetearTema();
    this.router.navigate(['/login']);
  }

  // ── Restaurar sesión al recargar la página ───────────────────
  restaurarSesion(): void {
    const empId      = localStorage.getItem('empresa_id');
    const usuarioStr = localStorage.getItem('usuario');
    const empresaStr = localStorage.getItem('empresa'); // ✅ FIX: leer empresa cacheada

    if (empId && usuarioStr) {
      const usuario: Usuario = JSON.parse(usuarioStr);
      this._usuarioActivo.set(usuario);
      this._isAuthenticated.set(true);

      // ✅ FIX: restaurar empresa INMEDIATAMENTE desde localStorage
      // así no hay ningún delay y el guard funciona al instante
      if (empresaStr) {
        const empresa: Empresa = JSON.parse(empresaStr);
        this._empresaActiva.set(empresa);
        this.aplicarTemaEmpresa(empresa);
      }

      // Refrescar desde backend en segundo plano (para colores actualizados)
      this.http.get<Empresa>(`${API}/empresas/${empId}`).subscribe({
        next: empresa => {
          this._empresaActiva.set(empresa);
          this.aplicarTemaEmpresa(empresa);
          localStorage.setItem('empresa', JSON.stringify(empresa)); // mantener cache fresco
          this.cargarEmpresas().subscribe();
        },
        error: () => this.logout()
      });
    }
  }

  // ── Theming dinámico según empresa ───────────────────────────
  private aplicarTemaEmpresa(empresa: Empresa | null): void {
    if (!empresa) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primario',    empresa.color_primario);
    root.style.setProperty('--color-secundario',  empresa.color_secundario ?? empresa.color_primario);
    root.style.setProperty('--color-texto',       empresa.color_texto ?? '#FFFFFF');
  }

  private resetearTema(): void {
    const root = document.documentElement;
    root.style.removeProperty('--color-primario');
    root.style.removeProperty('--color-secundario');
    root.style.removeProperty('--color-texto');
  }
}