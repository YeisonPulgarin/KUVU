import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppLayoutComponent, MENSAJE_ERROR_CARGA } from './app-layout.component';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { ToastService } from '../toast/toast.service';

@Component({
  standalone: true,
  imports: [AppLayoutComponent],
  template: `
    <a class="btn-primary afuera" href="/acceder">Ingresar</a>
    <app-layout [pagina]="pagina()">
      <div class="page"><h1>Contenido</h1><button class="btn-primary adentro">Nuevo</button></div>
    </app-layout>`
})
class HostComponent {
  pagina = signal('Contratos');
}

describe('AppLayoutComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  const errorCarga = signal(false);
  const AMARILLA = { id: 1, nombre: 'Amarilo', color_primario: '#F5A623', color_secundario: '#F5A623' };
  const empresaActiva = signal<typeof AMARILLA | null>(AMARILLA);
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    errorCarga.set(false);
    empresaActiva.set(AMARILLA);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            empresaActiva,
            usuarioActivo: signal({ idUsuario: 1, nombre: 'Wilson Solano', idRol: 1 }),
            logout: jasmine.createSpy('logout')
          }
        },
        { provide: DataService, useValue: { errorCarga } }
      ]
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders the sidebar, the projected screen and the toast and confirm hosts', () => {
    expect(el().querySelector('.app-layout app-sidebar')).not.toBeNull();
    expect(el().querySelector('main.main-content h1')!.textContent).toBe('Contenido');
    expect(el().querySelector('app-toast-host')).not.toBeNull();
    expect(el().querySelector('app-confirm-host')).not.toBeNull();
  });

  it('paints a subtle grain on the page background, without any layer over the content', () => {
    const main = el().querySelector<HTMLElement>('main.main-content')!;
    const estilo = getComputedStyle(main);
    expect(estilo.backgroundImage).toContain('data:image/svg+xml');
    expect(estilo.backgroundImage).toContain('feTurbulence');
    expect(estilo.backgroundImage).toContain('linear-gradient');
    expect(getComputedStyle(main, '::before').content).toBe('none');
    expect(getComputedStyle(main, '::after').content).toBe('none');
  });

  it('shows an accessible breadcrumb "{Empresa} › {Página}" linking the company to the dashboard', () => {
    const nav = el().querySelector('nav.app-breadcrumb')!;
    expect(nav.getAttribute('aria-label')).toBe('Ruta');
    const enlace = nav.querySelector('a')!;
    expect(enlace.textContent!.trim()).toBe('Amarilo');
    expect(enlace.getAttribute('href')).toBe('/dashboard');
    const actual = nav.querySelector('[aria-current="page"]')!;
    expect(actual.textContent!.trim()).toBe('Contratos');
    expect(nav.querySelector('.app-breadcrumb__sep')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('does not link the company on the dashboard itself', () => {
    fixture.componentInstance.pagina.set('Inicio');
    fixture.detectChanges();
    const nav = el().querySelector('nav.app-breadcrumb')!;
    expect(nav.querySelector('a')).toBeNull();
    expect(nav.textContent).toContain('Amarilo');
    expect(nav.querySelector('[aria-current="page"]')!.textContent!.trim()).toBe('Inicio');
  });

  describe('company brand', () => {
    const host = () => el().querySelector<HTMLElement>('app-layout')!;
    const fondo = (selector: string) => getComputedStyle(el().querySelector(selector)!).backgroundImage;
    // KUVU blue of :root (#2B4C8C → #3A6FD8) and the Amarilo yellow (#F5A623).
    const AZUL_1 = 'rgb(43, 76, 140)';
    const AZUL_2 = 'rgb(58, 111, 216)';
    const AMARILLO = 'rgb(245, 166, 35)';

    it('declares the company tokens on its host, with a dark label on a light brand', () => {
      expect(host().style.getPropertyValue('--color-primario')).toBe('#F5A623');
      expect(host().style.getPropertyValue('--color-secundario')).toBe('#F5A623');
      expect(host().style.getPropertyValue('--color-texto')).toBe('#FFFFFF');
      expect(host().style.getPropertyValue('--color-primario-contraste')).toBe('#1a202c');
    });

    it('paints the in-app primary button with the company color', () => {
      expect(fondo('.btn-primary.adentro')).toContain(AMARILLO);
    });

    // Regression: a yellow company signed in must not turn the public "Ingresar" yellow.
    it('keeps a primary button outside the app (public "Ingresar") on the KUVU blue', () => {
      const afuera = fondo('.btn-primary.afuera');
      expect(afuera).toContain(AZUL_1);
      expect(afuera).toContain(AZUL_2);
      expect(afuera).not.toContain(AMARILLO);
      expect(document.documentElement.style.getPropertyValue('--color-primario')).toBe('');
    });

    it('declares no tokens without an active company', () => {
      empresaActiva.set(null);
      fixture.detectChanges();
      expect(host().style.getPropertyValue('--color-primario')).toBe('');
      expect(host().style.getPropertyValue('--color-primario-contraste')).toBe('');
    });
  });

  it('raises an error toast when the data load fails', () => {
    const toast = TestBed.inject(ToastService);
    spyOn(toast, 'error');
    errorCarga.set(true);
    fixture.detectChanges();
    expect(toast.error).toHaveBeenCalledOnceWith(MENSAJE_ERROR_CARGA);
  });
});
