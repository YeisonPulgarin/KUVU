import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CambiarPasswordComponent } from './cambiar-password.component';
import { AuthService, MENSAJE_ACCESO } from '../../services/auth.service';

const EMPRESA = { id: 2, nombre: 'Nido Rent', subdominio: 'nido' };

describe('CambiarPasswordComponent', () => {
  let fixture: ComponentFixture<CambiarPasswordComponent>;
  let component: CambiarPasswordComponent;
  let root: HTMLElement;
  let cambiarSpy: jasmine.Spy;
  let logoutSpy: jasmine.Spy;
  let router: jasmine.SpyObj<Router>;
  const pendiente = signal<object | null>(null);
  const usuario = signal<object | null>(null);

  function create(): void {
    fixture = TestBed.createComponent(CambiarPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  }

  function fill(actual: string, nueva: string, confirmacion = nueva): void {
    component.actual.set(actual);
    component.onNueva(nueva);
    component.confirmacion.set(confirmacion);
    fixture.detectChanges();
  }

  const submit = () => root.querySelector('button[type="submit"]') as HTMLButtonElement;

  beforeEach(async () => {
    pendiente.set({ correo: 'ana@kuvu.co', documento: '1128074279', empresa_id: 2, empresa: EMPRESA });
    usuario.set(null);
    cambiarSpy = jasmine.createSpy('cambiarPassword');
    logoutSpy = jasmine.createSpy('logout');
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CambiarPasswordComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            cambioPendiente: pendiente,
            usuarioActivo: usuario,
            empresaActiva: signal(null),
            cambiarPassword: cambiarSpy,
            logout: logoutSpy,
          },
        },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
    create();
  });

  it('shows the forced mode after a temporary password', () => {
    expect(component.obligatorio()).toBeTrue();
    expect(root.querySelector('.step-title')!.textContent).toContain('Crea tu contraseña');
    expect(root.querySelector('label[for="cp-actual"]')!.textContent).toContain('Contraseña temporal');
    expect(root.querySelector('.badge-nombre')!.textContent).toContain('Nido Rent');
  });

  it('shows the voluntary mode for a signed-in user', () => {
    pendiente.set(null);
    usuario.set({ correo: 'ana@kuvu.co', documento: '1128074279', empresa_id: 2 });
    fixture.detectChanges();

    expect(component.obligatorio()).toBeFalse();
    expect(root.querySelector('.step-title')!.textContent).toContain('Cambiar contraseña');
  });

  it('marks each rule live as the new password is typed', () => {
    fill('1128074279', 'tejado');
    const ok = () => Array.from(root.querySelectorAll('.cp-regla--ok')).map((li) => li.getAttribute('data-codigo'));
    expect(ok()).toContain('MINUSCULA');
    expect(ok()).not.toContain('MAYUSCULA');

    fill('1128074279', 'Tejado#Azul42');
    expect(root.querySelectorAll('.cp-regla:not(.cp-regla--ok)').length).toBe(0);
  });

  it('flags a new password containing the document', () => {
    fill('1128074279', 'Clave#1128074279');
    const pendientes = Array.from(root.querySelectorAll('.cp-regla:not(.cp-regla--ok)'))
      .map((li) => li.getAttribute('data-codigo'));
    expect(pendientes).toContain('CONTIENE_DATOS');
    expect(submit().disabled).toBeTrue();
  });

  it('keeps submit disabled until the rules pass and the confirmation matches', () => {
    expect(submit().disabled).toBeTrue();
    fill('1128074279', 'Tejado#Azul42', 'Tejado#Azul4');
    expect(submit().disabled).toBeTrue();
    expect(root.querySelector('.cp-nota')!.textContent).toContain('no coinciden');
    fill('1128074279', 'Tejado#Azul42');
    expect(submit().disabled).toBeFalse();
  });

  it('changes the password and goes to the dashboard', () => {
    cambiarSpy.and.returnValue(of({ ok: true }));
    fill('1128074279', 'Tejado#Azul42');

    submit().click();

    expect(cambiarSpy).toHaveBeenCalledWith('1128074279', 'Tejado#Azul42');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.nueva()).toBe('');
  });

  it('shows the rules the backend rejects (e.g. a common password)', () => {
    cambiarSpy.and.returnValue(throwError(() => ({
      status: 400, error: { reglas: [{ codigo: 'COMUN', mensaje: 'Es una contraseña demasiado común. Elige otra.' }] },
    })));
    fill('1128074279', 'Tejado#Azul42');

    submit().click();
    fixture.detectChanges();

    expect(root.querySelector('.cp-errores [data-codigo="COMUN"]')!.textContent).toContain('demasiado común');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('shows the generic access message on 401 and clears the current password', () => {
    cambiarSpy.and.returnValue(throwError(() => ({ status: 401 })));
    fill('mala', 'Tejado#Azul42');

    submit().click();
    fixture.detectChanges();

    expect(root.querySelector('.login-error')!.textContent).toContain(MENSAJE_ACCESO);
    expect(component.actual()).toBe('');
  });

  it('leaving the forced change logs out', () => {
    (root.querySelector('.back-btn') as HTMLButtonElement).click();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('leaving the voluntary change goes back to the dashboard', () => {
    pendiente.set(null);
    usuario.set({ correo: 'ana@kuvu.co', documento: '1128074279', empresa_id: 2 });
    fixture.detectChanges();

    (root.querySelector('.back-btn') as HTMLButtonElement).click();

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
