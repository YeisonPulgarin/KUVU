import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

const API = 'http://localhost:3000/api';

const EMPRESA = {
  id: 2, nombre: 'Nido Rent', subdominio: 'nido', color_primario: '#0b3b5c', color_secundario: '#0d6e8e',
  color_texto: '#ffffff', logo_url: '', slogan: 'Tu hogar', activo: true,
};
const USUARIO = {
  idUsuario: 7, empresa_id: 2, nombre: 'Ana', documento: '1128074279', correo: 'ana@kuvu.co', idRol: 2,
};
const OK = { ok: true, requiereCambioPassword: false, usuario: USUARIO, empresa: EMPRESA };

describe('AuthService (passwords)', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: Router, useValue: router }],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    document.documentElement.style.removeProperty('--color-primario');
    document.documentElement.style.removeProperty('--color-secundario');
    document.documentElement.style.removeProperty('--color-texto');
  });

  it('posts correo, documento, password and empresa to the login endpoint', () => {
    auth.login('ana@kuvu.co', '1128074279', 'Tejado#Azul42', 2).subscribe();

    const req = http.expectOne(`${API}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      correo: 'ana@kuvu.co', documento: '1128074279', password: 'Tejado#Azul42', empresa_id: 2,
    });
    req.flush(OK);
  });

  it('opens and persists the session on a normal login, without the password', () => {
    auth.login('ana@kuvu.co', '1128074279', 'Tejado#Azul42', 2).subscribe();
    http.expectOne(`${API}/auth/login`).flush(OK);

    expect(auth.isAuthenticated()).toBeTrue();
    expect(auth.usuarioActivo()?.idUsuario).toBe(7);
    expect(auth.empresaActiva()?.id).toBe(2);
    expect(localStorage.getItem('usuario')).toContain('"idUsuario":7');
    expect(JSON.stringify(localStorage)).not.toContain('Tejado#Azul42');
    expect(auth.cambioPendiente()).toBeNull();
  });

  it('keeps a required change in memory only: no session, nothing stored, no password', () => {
    auth.login('ana@kuvu.co', '1128074279', 'Tejado#Azul42', 2, EMPRESA).subscribe();
    http.expectOne(`${API}/auth/login`).flush({ ok: true, requiereCambioPassword: true });

    expect(auth.isAuthenticated()).toBeFalse();
    expect(localStorage.length).toBe(0);
    expect(auth.cambioPendiente()).toEqual({
      correo: 'ana@kuvu.co', documento: '1128074279', empresa_id: 2, empresa: EMPRESA,
    });
    expect(JSON.stringify(auth.cambioPendiente())).not.toContain('Tejado#Azul42');
  });

  it('changes a pending password with the remembered identity and opens the session', () => {
    auth.login('ana@kuvu.co', '1128074279', '1128074279', 2, EMPRESA).subscribe();
    http.expectOne(`${API}/auth/login`).flush({ ok: true, requiereCambioPassword: true });

    auth.cambiarPassword('1128074279', 'Ventana$Roja77').subscribe();
    const req = http.expectOne(`${API}/auth/cambiar-password`);
    expect(req.request.body).toEqual({
      correo: 'ana@kuvu.co', documento: '1128074279', empresa_id: 2,
      password: '1128074279', passwordNueva: 'Ventana$Roja77',
    });
    req.flush(OK);

    expect(auth.cambioPendiente()).toBeNull();
    expect(auth.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem('empresa_id')).toBe('2');
  });

  it('changes the password of the signed-in user (voluntary change)', () => {
    auth.login('ana@kuvu.co', '1128074279', 'Tejado#Azul42', 2).subscribe();
    http.expectOne(`${API}/auth/login`).flush(OK);

    auth.cambiarPassword('Tejado#Azul42', 'Ventana$Roja77').subscribe();
    const req = http.expectOne(`${API}/auth/cambiar-password`);
    expect(req.request.body.correo).toBe('ana@kuvu.co');
    expect(req.request.body.documento).toBe('1128074279');
    expect(req.request.body.empresa_id).toBe(2);
    req.flush(OK);
  });

  it('keeps the pending change when the change fails', () => {
    auth.login('ana@kuvu.co', '1128074279', '1128074279', 2).subscribe();
    http.expectOne(`${API}/auth/login`).flush({ ok: true, requiereCambioPassword: true });

    auth.cambiarPassword('1128074279', 'Password1!').subscribe({ error: () => {} });
    http.expectOne(`${API}/auth/cambiar-password`).flush(
      { error: 'La contraseña no cumple la política', reglas: [{ codigo: 'COMUN', mensaje: 'x' }] },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(auth.cambioPendiente()).not.toBeNull();
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it('logout clears the pending change', () => {
    auth.login('ana@kuvu.co', '1128074279', '1128074279', 2).subscribe();
    http.expectOne(`${API}/auth/login`).flush({ ok: true, requiereCambioPassword: true });

    auth.logout();

    expect(auth.cambioPendiente()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
