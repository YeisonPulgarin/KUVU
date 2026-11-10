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
  template: `<app-layout [pagina]="pagina()"><div class="page"><h1>Contenido</h1></div></app-layout>`
})
class HostComponent {
  pagina = signal('Contratos');
}

describe('AppLayoutComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  const errorCarga = signal(false);
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    errorCarga.set(false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            empresaActiva: signal({ id: 1, nombre: 'Amarilo', color_primario: '#F5A623' }),
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

  it('raises an error toast when the data load fails', () => {
    const toast = TestBed.inject(ToastService);
    spyOn(toast, 'error');
    errorCarga.set(true);
    fixture.detectChanges();
    expect(toast.error).toHaveBeenCalledOnceWith(MENSAJE_ERROR_CARGA);
  });
});
