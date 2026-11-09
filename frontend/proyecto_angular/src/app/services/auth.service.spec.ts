import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService brand theming', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const root = document.documentElement;
  const contrasteVar = () => root.style.getPropertyValue('--color-primario-contraste');

  function login(colorPrimario: string): void {
    service.login('admin@empresa.co', '123', 1).subscribe();
    http.expectOne(req => req.url.endsWith('/auth/login')).flush({
      ok: true,
      usuario: { idUsuario: 1, empresa_id: 1, nombre: 'Ana Admin', documento: '123', idRol: 1 },
      empresa: { id: 1, nombre: 'Empresa', color_primario: colorPrimario, color_secundario: colorPrimario }
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    root.style.removeProperty('--color-primario');
    root.style.removeProperty('--color-secundario');
    root.style.removeProperty('--color-texto');
    root.style.removeProperty('--color-primario-contraste');
    localStorage.clear();
    http.verify();
  });

  it('publishes a dark label for a light brand (Amarilo)', () => {
    login('#F5A623');
    expect(contrasteVar()).toBe('#1a202c');
  });

  it('publishes a white label for a dark brand (Mi Inmueble)', () => {
    login('#2B4C8C');
    expect(contrasteVar()).toBe('#ffffff');
  });

  it('removes the label color on logout', () => {
    login('#F5A623');
    service.logout();
    expect(contrasteVar()).toBe('');
  });
});
