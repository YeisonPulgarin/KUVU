import { ComponentFixture, TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { UsuariosComponent } from './usuarios.component';
import { AppDoubles, ARRENDATARIO, crearDobles, esperar, tieneEmoji } from '../shared/testing/app-doubles';
import { MatchMediaStub } from '../../motion/testing/match-media.stub';

describe('UsuariosComponent', () => {
  let fixture: ComponentFixture<UsuariosComponent>;
  let d: AppDoubles;
  let media: MatchMediaStub;
  const el = () => fixture.nativeElement as HTMLElement;
  const tarjeta = (nombre: string) =>
    Array.from(el().querySelectorAll('.usuario-card')).find(c => c.textContent!.includes(nombre))!;
  const porLabel = (raiz: Element, label: string) =>
    raiz.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

  beforeEach(() => {
    media = new MatchMediaStub({ reducedMotion: true }).install();
    d = crearDobles();
    TestBed.configureTestingModule({ imports: [UsuariosComponent], providers: d.providers });
    fixture = TestBed.createComponent(UsuariosComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    media.restore();
    fixture.destroy();
    (fixture.nativeElement as HTMLElement).remove();
  });

  it('uses named icon buttons: edit as info and delete as danger at rest, no emoji', () => {
    const carlos = tarjeta('Carlos Lesmes');
    const editar = porLabel(carlos, 'Editar a Carlos Lesmes');
    const eliminar = porLabel(carlos, 'Eliminar a Carlos Lesmes');
    expect(editar.classList).toContain('btn-action--info');
    expect(eliminar.classList).toContain('btn-action--danger');
    expect(eliminar.querySelector('app-icon svg')).not.toBeNull();
    expect(tieneEmoji(el().textContent!)).toBeFalse();
  });

  it('disables deleting your own user and explains why (R2.5)', () => {
    const yo = tarjeta('Wilson Solano');
    const eliminar = porLabel(yo, 'Eliminar a Wilson Solano');
    expect(eliminar.disabled).toBeTrue();
    const explicacion = document.getElementById(eliminar.getAttribute('aria-describedby')!)!;
    expect(explicacion.textContent).toContain('No puedes eliminar tu propio usuario');
  });

  it('deletes another user after a danger confirmation, with a success toast', async () => {
    porLabel(tarjeta('Carlos Lesmes'), 'Eliminar a Carlos Lesmes').click();
    await esperar();
    expect(d.confirm.confirmar).toHaveBeenCalledWith(jasmine.objectContaining({
      variante: 'danger',
      mensaje: jasmine.stringContaining('Carlos Lesmes')
    }));
    expect(d.data.eliminarUsuario).toHaveBeenCalledWith(2, 1);
    expect(d.toast.exito).toHaveBeenCalledWith('Carlos Lesmes eliminado.');
  });

  it('does not delete when cancelled, and reports a rejected delete', async () => {
    d.confirm.confirmar.and.resolveTo(false);
    porLabel(tarjeta('Carlos Lesmes'), 'Eliminar a Carlos Lesmes').click();
    await esperar();
    expect(d.data.eliminarUsuario).not.toHaveBeenCalled();

    d.confirm.confirmar.and.resolveTo(true);
    d.data.eliminarUsuario.and.returnValue(throwError(() => new Error('fk')));
    porLabel(tarjeta('Carlos Lesmes'), 'Eliminar a Carlos Lesmes').click();
    await esperar();
    expect(d.toast.error).toHaveBeenCalledWith(jasmine.stringContaining('No se pudo eliminar a Carlos Lesmes'));
  });

  it('validates name and document, then creates with a temporary password and the admin password', () => {
    const c = fixture.componentInstance;
    c.abrirFormulario();
    fixture.detectChanges();
    c.guardar();
    fixture.detectChanges();
    expect(el().querySelector('dialog .error-msg')!.textContent).toContain('obligatorios');
    expect(el().querySelector('#usuario-nombre')!.getAttribute('aria-invalid')).toBe('true');

    Object.assign(c.form, { nombre: 'Ana Ruiz', documento: '1012345678', correo: 'ana@amarilo.co' });
    c.passwordTemporal.set('Ventana$Roja77');
    c.adminPassword.set('Admin$Seguro1');
    c.guardar();
    fixture.detectChanges();
    expect(d.data.agregarUsuario).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: 'Ana Ruiz', idRol: 2 }),
      'Ventana$Roja77',
      { correo: 'wilson@amarilo.co', documento: '1127723450', password: 'Admin$Seguro1', empresa_id: 1 }
    );
    expect(d.toast.exito).toHaveBeenCalledWith('Usuario creado.');
    expect(el().querySelector('dialog')).toBeNull();
    expect(c.adminPassword()).toBe('');
  });

  it('shows the temporary password rules live and blocks one that breaks them', async () => {
    const c = fixture.componentInstance;
    c.abrirFormulario();
    fixture.detectChanges();
    await fixture.whenStable();
    const documento = el().querySelector<HTMLInputElement>('#usuario-documento')!;
    documento.value = '1012345678';
    documento.dispatchEvent(new Event('input'));
    Object.assign(c.form, { nombre: 'Ana Ruiz' });
    c.passwordTemporal.set('Clave#1012345678');
    fixture.detectChanges();

    const pendientes = Array.from(el().querySelectorAll('#usuario-reglas li:not(.reglas-password__ok)'))
      .map(li => li.getAttribute('data-codigo'));
    expect(pendientes).toEqual(['CONTIENE_DATOS']);

    c.adminPassword.set('Admin$Seguro1');
    c.guardar();
    fixture.detectChanges();
    expect(d.data.agregarUsuario).not.toHaveBeenCalled();
    expect(el().querySelector('dialog .error-msg')!.textContent).toContain('política');
  });

  it('requires the administrator password to create', () => {
    const c = fixture.componentInstance;
    c.abrirFormulario();
    Object.assign(c.form, { nombre: 'Ana Ruiz', documento: '1012345678' });
    c.passwordTemporal.set('Ventana$Roja77');
    c.guardar();
    fixture.detectChanges();
    expect(d.data.agregarUsuario).not.toHaveBeenCalled();
    expect(el().querySelector('dialog .error-msg')!.textContent).toContain('confirmar que eres administrador');
  });

  it('explains a rejected creation: wrong admin password, forbidden, or policy rules', () => {
    const c = fixture.componentInstance;
    const intentar = () => {
      c.abrirFormulario();
      fixture.detectChanges();
      Object.assign(c.form, { nombre: 'Ana Ruiz', documento: '1012345678' });
      c.passwordTemporal.set('Ventana$Roja77');
      c.adminPassword.set('Admin$Seguro1');
      c.guardar();
      fixture.detectChanges();
      return el().querySelector('dialog')!.textContent!;
    };

    d.data.agregarUsuario.and.returnValue(throwError(() => ({ status: 401 })));
    expect(intentar()).toContain('contraseña de administrador no es correcta');

    d.data.agregarUsuario.and.returnValue(throwError(() => ({ status: 403, error: { error: 'No tienes permiso para esta operación.' } })));
    expect(intentar()).toContain('No tienes permiso');

    d.data.agregarUsuario.and.returnValue(throwError(() => ({
      status: 400, error: { reglas: [{ codigo: 'COMUN', mensaje: 'Es una contraseña demasiado común. Elige otra.' }] }
    })));
    expect(intentar()).toContain('demasiado común');
    expect(d.toast.exito).not.toHaveBeenCalled();
  });

  it('edits without any password field', () => {
    const c = fixture.componentInstance;
    c.abrirFormulario(ARRENDATARIO);
    fixture.detectChanges();
    expect(el().querySelector('#usuario-password-temporal')).toBeNull();
    expect(el().querySelector('#usuario-admin-password')).toBeNull();

    c.guardar();
    expect(d.data.actualizarUsuario).toHaveBeenCalledWith(2, jasmine.objectContaining({ nombre: 'Carlos Lesmes' }));
  });

  it('marks users that still have a temporary password', () => {
    expect(tarjeta('Carlos Lesmes').querySelector('.badge--temporal')!.textContent).toContain('Contraseña temporal');
    expect(tarjeta('Wilson Solano').querySelector('.badge--temporal')).toBeNull();
  });

  it('offers resetting the password of others but not your own', () => {
    expect(porLabel(tarjeta('Carlos Lesmes'), 'Restablecer contraseña de Carlos Lesmes')).not.toBeNull();
    expect(porLabel(tarjeta('Wilson Solano'), 'Restablecer contraseña de Wilson Solano')).toBeNull();
  });

  it('resets a password with a temporary one and the admin password, with a toast', () => {
    porLabel(tarjeta('Carlos Lesmes'), 'Restablecer contraseña de Carlos Lesmes').click();
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(el().querySelector('dialog')!.textContent).toContain('Restablecer contraseña de Carlos Lesmes');

    c.resetTemporal.set('Ventana$Roja77');
    c.resetAdminPassword.set('Admin$Seguro1');
    c.restablecer();
    fixture.detectChanges();

    expect(d.data.restablecerPassword).toHaveBeenCalledWith(2, 1, 'Ventana$Roja77',
      { correo: 'wilson@amarilo.co', documento: '1127723450', password: 'Admin$Seguro1', empresa_id: 1 });
    expect(d.toast.exito).toHaveBeenCalledWith(jasmine.stringContaining('Deberá cambiarla al ingresar'));
    expect(el().querySelector('dialog')).toBeNull();
  });

  it('does not reset with a temporary password that breaks the policy, and reports a wrong admin password', () => {
    porLabel(tarjeta('Carlos Lesmes'), 'Restablecer contraseña de Carlos Lesmes').click();
    fixture.detectChanges();
    const c = fixture.componentInstance;

    c.resetTemporal.set('carlos21249773');
    c.resetAdminPassword.set('Admin$Seguro1');
    c.restablecer();
    expect(d.data.restablecerPassword).not.toHaveBeenCalled();
    expect(c.resetError()).toContain('política');

    d.data.restablecerPassword.and.returnValue(throwError(() => ({ status: 401 })));
    c.resetTemporal.set('Ventana$Roja77');
    c.restablecer();
    fixture.detectChanges();
    expect(c.resetError()).toContain('contraseña de administrador no es correcta');
    expect(c.resetAdminPassword()).toBe('');
  });

  it('labels the search and role filters for assistive technology', () => {
    expect(el().querySelector('label[for="usuarios-buscar"]')).not.toBeNull();
    expect(el().querySelector('label[for="usuarios-rol"]')).not.toBeNull();
  });
});
