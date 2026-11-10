import { ComponentFixture, TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { UsuariosComponent } from './usuarios.component';
import { AppDoubles, crearDobles, esperar, tieneEmoji } from '../shared/testing/app-doubles';
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

  it('validates name and document, then creates with a toast', () => {
    fixture.componentInstance.abrirFormulario();
    fixture.detectChanges();
    fixture.componentInstance.guardar();
    fixture.detectChanges();
    expect(el().querySelector('dialog .error-msg')!.textContent).toContain('obligatorios');
    expect(el().querySelector('#usuario-nombre')!.getAttribute('aria-invalid')).toBe('true');

    Object.assign(fixture.componentInstance.form, { nombre: 'Ana Ruiz', documento: '123' });
    fixture.componentInstance.guardar();
    fixture.detectChanges();
    expect(d.data.agregarUsuario).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Ana Ruiz', idRol: 2 }));
    expect(d.toast.exito).toHaveBeenCalledWith('Usuario creado.');
    expect(el().querySelector('dialog')).toBeNull();
  });

  it('labels the search and role filters for assistive technology', () => {
    expect(el().querySelector('label[for="usuarios-buscar"]')).not.toBeNull();
    expect(el().querySelector('label[for="usuarios-rol"]')).not.toBeNull();
  });
});
