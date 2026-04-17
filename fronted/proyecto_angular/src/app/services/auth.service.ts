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

  // ── Login contra el backend (correo + documento) ─────────────
  // ✅ FIX: el tipo de respuesta ahora incluye "empresa" que ya devuelve auth.js
  login(correo: string, documento: string, empresa_id: number): Observable<{ ok: boolean; usuario: Usuario; empresa: Empresa }> {
    return this.http.post<{ ok: boolean; usuario: Usuario; empresa: Empresa }>(
      `${API}/auth/login`,
      { correo, documento, empresa_id }
    ).pipe(
      tap(resp => {
        if (resp.ok) {
          // ✅ FIX PRINCIPAL: usar resp.empresa directamente (viene del backend)
          // NO depender de this._empresas().find() que puede estar vacío o
          // encontrar la empresa equivocada si hay un timing issue
          const empresa: Empresa = resp.empresa ?? this._empresas().find(e => e.id === empresa_id) ?? null;

          this._empresaActiva.set(empresa);
          this._usuarioActivo.set(resp.usuario);
          this._isAuthenticated.set(true);
          this.aplicarTemaEmpresa(empresa);

          // Persistir sesión en localStorage
          localStorage.setItem('empresa_id', String(empresa_id));
          localStorage.setItem('usuario',    JSON.stringify(resp.usuario));
          // ✅ FIX: guardar empresa completa para restaurarSesion sin delay HTTP
          if (empresa) localStorage.setItem('empresa', JSON.stringify(empresa));
        }
      })
    );
  }

  // ── Logout ───────────────────────────────────────────────────
  logout(): void {
    this._empresaActiva.set(null);
    this._usuarioActivo.set(null);
    this._isAuthenticated.set(false);
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