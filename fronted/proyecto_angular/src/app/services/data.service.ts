// ─────────────────────────────────────────────────────────────
//  data.service.ts  —  Llamadas reales a la API Node.js
//  FIXES:
//  1. cargarSiVacio() para que cada componente pueda cargar sus datos
//  2. todos los métodos CRUD devuelven Observable correctamente
// ─────────────────────────────────────────────────────────────
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  Usuario, Local, ContratoArrendamiento,
  Mantenimiento, PagoVariado
} from '../models/index';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  // ── Signals de datos ─────────────────────────────────────────
  private _usuarios       = signal<Usuario[]>([]);
  private _locales        = signal<Local[]>([]);
  private _contratos      = signal<ContratoArrendamiento[]>([]);
  private _mantenimientos = signal<Mantenimiento[]>([]);
  private _pagos          = signal<PagoVariado[]>([]);
  private _cargando       = signal<boolean>(false);
  private _empresaIdCargada = signal<number | null>(null);

  cargando = computed(() => this._cargando());

  // ── Cargar TODO de una vez (desde dashboard o al refrescar) ──
  cargarTodo(empresaId: number): Observable<any> {
    this._cargando.set(true);
    this._empresaIdCargada.set(empresaId);
    const q = `?empresa_id=${empresaId}`;

    return forkJoin({
      usuarios:       this.http.get<Usuario[]>(`${API}/usuarios${q}`),
      locales:        this.http.get<Local[]>(`${API}/locales${q}`),
      contratos:      this.http.get<ContratoArrendamiento[]>(`${API}/contratos${q}`),
      mantenimientos: this.http.get<Mantenimiento[]>(`${API}/mantenimiento${q}`),
      pagos:          this.http.get<PagoVariado[]>(`${API}/pagos${q}`),
    }).pipe(
      tap(data => {
        this._usuarios.set(data.usuarios);
        this._locales.set(data.locales);
        this._contratos.set(data.contratos);
        this._mantenimientos.set(data.mantenimientos);
        this._pagos.set(data.pagos);
        this._cargando.set(false);
      })
    );
  }

  // ── Si los datos están vacíos, cargar desde backend ─────────
  // Cada componente llama esto en ngOnInit para no depender del dashboard
  cargarSiVacio(empresaId: number): void {
    if (this._empresaIdCargada() === empresaId && this._locales().length > 0) return;
    this.cargarTodo(empresaId).subscribe({
      error: err => console.error('Error cargando datos:', err)
    });
  }

  // ── Getters ──────────────────────────────────────────────────
  getUsuarios()       { return computed(() => this._usuarios()); }
  getLocales()        { return computed(() => this._locales()); }
  getContratos()      { return computed(() => this._contratos()); }
  getMantenimientos() { return computed(() => this._mantenimientos()); }
  getPagos()          { return computed(() => this._pagos()); }

  // ── Estadísticas dashboard ────────────────────────────────────
  getEstadisticas() {
    return computed(() => {
      const pagos = this._pagos();
      const mants = this._mantenimientos();
      return {
        totalLocales:     this._locales().length,
        totalContratos:   this._contratos().length,
        totalPagos:       pagos.length,
        totalRecaudado:   pagos.filter(p => p.tipo === 'Arriendo').reduce((a, p) => a + Number(p.monto), 0),
        mantenPendientes: mants.filter(m => m.estado === 'pendiente').length,
        mantenUrgentes:   mants.filter(m => m.prioridad === 'urgente' && m.estado !== 'completado').length,
      };
    });
  }

  // ── CRUD Locales ──────────────────────────────────────────────
  agregarLocal(local: Partial<Local>): Observable<any> {
    return this.http.post(`${API}/locales`, local).pipe(
      tap(() => this.recargarLocales(local.empresa_id!))
    );
  }

  actualizarLocal(id: number, local: Partial<Local>): Observable<any> {
    return this.http.put(`${API}/locales/${id}`, local).pipe(
      tap(() => this.recargarLocales(local.empresa_id!))
    );
  }

  eliminarLocal(id: number, empresaId: number): Observable<any> {
    return this.http.delete(`${API}/locales/${id}`).pipe(
      tap(() => this.recargarLocales(empresaId))
    );
  }

  private recargarLocales(empresaId: number): void {
    this.http.get<Local[]>(`${API}/locales?empresa_id=${empresaId}`)
      .subscribe(data => this._locales.set(data));
  }

  // ── CRUD Contratos ────────────────────────────────────────────
  agregarContrato(contrato: Partial<ContratoArrendamiento>): Observable<any> {
    return this.http.post(`${API}/contratos`, contrato).pipe(
      tap(() => this.recargarContratos(contrato.empresa_id!))
    );
  }

  actualizarContrato(id: number, contrato: Partial<ContratoArrendamiento>): Observable<any> {
    return this.http.put(`${API}/contratos/${id}`, contrato).pipe(
      tap(() => this.recargarContratos(contrato.empresa_id!))
    );
  }

  private recargarContratos(empresaId: number): void {
    this.http.get<ContratoArrendamiento[]>(`${API}/contratos?empresa_id=${empresaId}`)
      .subscribe(data => this._contratos.set(data));
  }

  // ── CRUD Pagos ────────────────────────────────────────────────
  agregarPago(pago: Partial<PagoVariado>): Observable<any> {
    return this.http.post(`${API}/pagos`, pago).pipe(
      tap(() => this.recargarPagos(pago.empresa_id!))
    );
  }

  eliminarPago(id: number, empresaId: number): Observable<any> {
    return this.http.delete(`${API}/pagos/${id}`).pipe(
      tap(() => this.recargarPagos(empresaId))
    );
  }

  private recargarPagos(empresaId: number): void {
    this.http.get<PagoVariado[]>(`${API}/pagos?empresa_id=${empresaId}`)
      .subscribe(data => this._pagos.set(data));
  }

  // ── CRUD Mantenimiento ────────────────────────────────────────
  agregarMantenimiento(m: Partial<Mantenimiento>): Observable<any> {
    return this.http.post(`${API}/mantenimiento`, m).pipe(
      tap(() => this.recargarMantenimientos(m.empresa_id!))
    );
  }

  actualizarEstadoMantenimiento(id: number, estado: string, empresaId: number): Observable<any> {
    return this.http.put(`${API}/mantenimiento/${id}`, { estado }).pipe(
      tap(() => this.recargarMantenimientos(empresaId))
    );
  }

  private recargarMantenimientos(empresaId: number): void {
    this.http.get<Mantenimiento[]>(`${API}/mantenimiento?empresa_id=${empresaId}`)
      .subscribe(data => this._mantenimientos.set(data));
  }

  // ── CRUD Usuarios ─────────────────────────────────────────────
  agregarUsuario(usuario: Partial<Usuario>): Observable<any> {
    return this.http.post(`${API}/usuarios`, usuario).pipe(
      tap(() => this.recargarUsuarios(usuario.empresa_id!))
    );
  }

  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<any> {
    return this.http.put(`${API}/usuarios/${id}`, usuario).pipe(
      tap(() => this.recargarUsuarios(usuario.empresa_id!))
    );
  }

  eliminarUsuario(id: number, empresaId: number): Observable<any> {
    return this.http.delete(`${API}/usuarios/${id}`).pipe(
      tap(() => this.recargarUsuarios(empresaId))
    );
  }

  private recargarUsuarios(empresaId: number): void {
    this.http.get<Usuario[]>(`${API}/usuarios?empresa_id=${empresaId}`)
      .subscribe(data => this._usuarios.set(data));
  }
}
