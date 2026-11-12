import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { ConfirmService } from '../confirm/confirm.service';
import { TAP_FEEDBACK_MS } from '../../../motion/tap-feedback';
import { contraste } from '../color-contrast';

@Component({ standalone: true, template: '' })
class PantallaVacia {}

/** Routes of the sidebar links, so a click can navigate in the spec. */
const RUTAS = ['dashboard', 'locales', 'contratos', 'pagos', 'mantenimiento', 'usuarios', 'cambiar-contrasena', 'login']
  .map(path => ({ path, component: PantallaVacia }));

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
        provideRouter(RUTAS),
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

  it('links to the password change, for any role', () => {
    crear(2);
    const link = el().querySelector<HTMLAnchorElement>('a.sidebar__password')!;
    expect(link.getAttribute('aria-label')).toBe('Cambiar contraseña');
    expect(link.getAttribute('href')).toBe('/cambiar-contrasena');
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

  describe('link feedback', () => {
    const links = () => Array.from(el().querySelectorAll<HTMLAnchorElement>('.sidebar__link'));
    const SIDEBAR_BG = '#133937';

    /** Same mix as --sidebar-acento: 30 % company color, 70 % white. */
    function acento(hex: string): string {
      const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
      return '#' + c.map(v => Math.round(v * 0.3 + 255 * 0.7).toString(16).padStart(2, '0')).join('');
    }

    it('wraps each link text in a label for the growing underline', () => {
      crear(1);
      expect(links().map(a => a.querySelector('.sidebar__label')?.textContent)).toEqual([
        'Dashboard', 'Locales', 'Contratos', 'Pagos', 'Mantenimiento', 'Usuarios'
      ]);
    });

    // Touch screens have no hover: the chosen link must show color, tint and underline by
    // itself (rules outside the motion block, so reduced motion too).
    it('paints the chosen link with the accent, a tint and a full underline', () => {
      crear(1);
      const link = links()[2];
      const label = link.querySelector<HTMLElement>('.sidebar__label')!;
      link.style.transition = 'none';
      label.style.transition = 'none';
      const reposo = getComputedStyle(link);
      const [colorReposo, fondoReposo] = [reposo.color, reposo.backgroundColor];
      expect(getComputedStyle(label).backgroundSize).toBe('0px 2px');

      link.classList.add('is-pressed');
      expect(getComputedStyle(label).backgroundSize).toBe('100% 2px');
      expect(getComputedStyle(link).color).not.toBe(colorReposo);
      expect(getComputedStyle(link).backgroundColor).not.toBe(fondoReposo);
    });

    it('keeps the accent text legible on the dark sidebar for any company color', () => {
      for (const color of ['#000000', '#2B4C8C', '#F5A623', '#2C7A7B', '#8B4513', '#0000FF', '#FFFFFF']) {
        expect(contraste(acento(color), SIDEBAR_BG)).withContext(color).toBeGreaterThanOrEqual(4.5);
      }
    });

    it('on mobile, keeps the drawer open with the chosen link marked until the pause ends', fakeAsync(() => {
      crear(1);
      const cmp = fixture.componentInstance;
      cmp.esMobile.set(true);
      cmp.abrirMenu();
      fixture.detectChanges();

      links()[3].click();
      fixture.detectChanges();
      expect(cmp.menuAbierto()).toBeTrue();
      expect(links()[3].classList).toContain('is-pressed');

      tick(TAP_FEEDBACK_MS);
      fixture.detectChanges();
      expect(cmp.menuAbierto()).toBeFalse();
      expect(links().some(a => a.classList.contains('is-pressed'))).toBeFalse();
    }));

    it('does not let the end of the navigation cut the pause on mobile', fakeAsync(() => {
      crear(1);
      const cmp = fixture.componentInstance;
      cmp.esMobile.set(true);
      cmp.abrirMenu();
      cmp.elegir('/pagos');
      TestBed.inject(Router).navigateByUrl('/pagos');
      tick(10);
      expect(cmp.menuAbierto()).toBeTrue();
      tick(TAP_FEEDBACK_MS);
      expect(cmp.menuAbierto()).toBeFalse();
    }));

    it('schedules nothing on desktop, where the sidebar stays', fakeAsync(() => {
      crear(1);
      const cmp = fixture.componentInstance;
      cmp.esMobile.set(false);
      cmp.elegir('/pagos');
      expect(cmp.elegido()).toBeNull();
      tick(TAP_FEEDBACK_MS);
    }));
  });
});
