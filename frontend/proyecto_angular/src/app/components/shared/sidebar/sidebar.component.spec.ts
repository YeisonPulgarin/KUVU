import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { ConfirmService } from '../confirm/confirm.service';

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let auth: { logout: jasmine.Spy; empresaActiva: unknown; usuarioActivo: unknown };
  let confirm: jasmine.SpyObj<ConfirmService>;
  const el = () => fixture.nativeElement as HTMLElement;

  function crear(idRol = 1): void {
    auth = {
      empresaActiva: signal({ id: 1, nombre: 'Amarilo', color_primario: '#F5A623' }),
      usuarioActivo: signal({ idUsuario: 1, nombre: 'Wilson Solano', idRol }),
      logout: jasmine.createSpy('logout')
    };
    confirm = jasmine.createSpyObj<ConfirmService>('ConfirmService', ['confirmar']);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: ConfirmService, useValue: confirm }
      ]
    });
    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
  }

  it('names its icon-only controls', () => {
    crear();
    expect(el().querySelector('.sidebar__toggle')!.getAttribute('aria-label')).toBe('Colapsar menú');
    expect(el().querySelector('.sidebar__logout')!.getAttribute('aria-label')).toBe('Cerrar sesión');
  });

  it('shows Locales and Usuarios only to the administrator', () => {
    crear(1);
    const textos = () => Array.from(el().querySelectorAll('.sidebar__link')).map(a => a.textContent!.trim());
    expect(textos()).toContain('Locales');
    expect(textos()).toContain('Usuarios');

    TestBed.resetTestingModule();
    crear(2);
    expect(textos()).not.toContain('Locales');
    expect(textos()).not.toContain('Usuarios');
  });

  it('asks before signing out and stays when the user cancels', async () => {
    crear();
    confirm.confirmar.and.resolveTo(false);
    await fixture.componentInstance.logout();
    expect(confirm.confirmar).toHaveBeenCalledWith(jasmine.objectContaining({ variante: 'neutral' }));
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('signs out and goes to /login when confirmed', async () => {
    crear();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    confirm.confirmar.and.resolveTo(true);
    await fixture.componentInstance.logout();
    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
