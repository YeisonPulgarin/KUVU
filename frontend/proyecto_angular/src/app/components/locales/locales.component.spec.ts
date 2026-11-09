import { ComponentFixture, TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { LocalesComponent } from './locales.component';
import { AppDoubles, crearDobles, esperar, tieneEmoji } from '../shared/testing/app-doubles';
import { MatchMediaStub } from '../../motion/testing/match-media.stub';
import { Local } from '../../models/index';

const LOCAL: Local = { idLocal: 5, empresa_id: 1, direccion: 'Calle 10 #20-30', area: 40, valorArriendo: 1500000, idAdministrador: 1 };

describe('LocalesComponent', () => {
  let fixture: ComponentFixture<LocalesComponent>;
  let d: AppDoubles;
  let media: MatchMediaStub;
  const el = () => fixture.nativeElement as HTMLElement;
  const boton = (texto: string, raiz: ParentNode = el()) =>
    Array.from(raiz.querySelectorAll<HTMLButtonElement>('button')).find(b => b.textContent!.trim() === texto)!;

  beforeEach(() => {
    media = new MatchMediaStub({ reducedMotion: true }).install();
    d = crearDobles();
    d.data.locales.set([LOCAL]);
    TestBed.configureTestingModule({ imports: [LocalesComponent], providers: d.providers });
    fixture = TestBed.createComponent(LocalesComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    media.restore();
    fixture.destroy();
    (fixture.nativeElement as HTMLElement).remove();
  });

  it('renders inside the layout with the breadcrumb and without emoji', () => {
    expect(el().querySelector('[aria-current="page"]')!.textContent!.trim()).toBe('Locales');
    expect(tieneEmoji(el().querySelector('h1')!.textContent!)).toBeFalse();
    el().querySelectorAll('button').forEach(b => expect(tieneEmoji(b.textContent!)).toBeFalse());
  });

  it('shows semantic row actions with icons: edit as info, delete as danger', () => {
    const fila = el().querySelector('tbody tr')!;
    const editar = boton('Editar', fila);
    const eliminar = boton('Eliminar', fila);
    expect(editar.classList).toContain('btn-action--info');
    expect(eliminar.classList).toContain('btn-action--danger');
    expect(eliminar.querySelector('app-icon svg')).not.toBeNull();
    expect(fila.textContent).toContain('Wilson Solano');
  });

  describe('delete', () => {
    it('asks with a danger confirmation naming the address, deletes and confirms with a toast', async () => {
      boton('Eliminar').click();
      await esperar();
      expect(d.confirm.confirmar).toHaveBeenCalledWith(jasmine.objectContaining({
        variante: 'danger',
        mensaje: jasmine.stringContaining('Calle 10 #20-30')
      }));
      expect(d.data.eliminarLocal).toHaveBeenCalledWith(5, 1);
      expect(d.toast.exito).toHaveBeenCalledWith(jasmine.stringContaining('Calle 10 #20-30'));
    });

    it('does nothing when the user cancels', async () => {
      d.confirm.confirmar.and.resolveTo(false);
      boton('Eliminar').click();
      await esperar();
      expect(d.data.eliminarLocal).not.toHaveBeenCalled();
      expect(d.toast.exito).not.toHaveBeenCalled();
    });

    it('keeps the row and shows an error toast when the backend rejects it', async () => {
      d.data.eliminarLocal.and.returnValue(throwError(() => new Error('fk')));
      boton('Eliminar').click();
      await esperar();
      fixture.detectChanges();
      expect(d.toast.error).toHaveBeenCalledWith(jasmine.stringContaining('No se pudo eliminar'));
      expect(el().querySelectorAll('tbody tr').length).toBe(1);
      expect(fixture.componentInstance.eliminandoId()).toBeNull();
    });

    it('marks the row busy and blocks other deletes while one is in flight', async () => {
      fixture.componentInstance.eliminandoId.set(5);
      fixture.detectChanges();
      expect(boton('Eliminar').getAttribute('aria-busy')).toBe('true');
      expect(boton('Eliminar').disabled).toBeTrue();
      await fixture.componentInstance.eliminar(LOCAL);
      expect(d.confirm.confirmar).not.toHaveBeenCalled();
    });
  });

  describe('form', () => {
    function abrirNuevo(): HTMLDialogElement {
      boton('Nuevo local').click();
      fixture.detectChanges();
      return el().querySelector('dialog')!;
    }

    it('associates every label with its field', () => {
      const dialog = abrirNuevo();
      dialog.querySelectorAll('label').forEach(label => {
        expect(dialog.querySelector(`#${label.getAttribute('for')}`)).not.toBeNull();
      });
    });

    it('shows the validation error and marks the address when it is missing (R4.3)', () => {
      const dialog = abrirNuevo();
      boton('Guardar', dialog).click();
      fixture.detectChanges();
      expect(dialog.querySelector('.error-msg')!.textContent).toContain('La dirección es obligatoria');
      expect(dialog.querySelector('.error-msg')!.getAttribute('role')).toBe('alert');
      expect(dialog.querySelector('#local-direccion')!.getAttribute('aria-invalid')).toBe('true');
      expect(d.data.agregarLocal).not.toHaveBeenCalled();
    });

    it('disables Guardar while saving', () => {
      abrirNuevo();
      fixture.componentInstance.guardando.set(true);
      fixture.detectChanges();
      const guardar = el().querySelector<HTMLButtonElement>('dialog button[type="submit"]')!;
      expect(guardar.disabled).toBeTrue();
      expect(guardar.textContent!.trim()).toBe('Guardando…');
    });

    it('creates the local, confirms with a toast and closes', () => {
      abrirNuevo();
      fixture.componentInstance.form.direccion = 'Carrera 7 #45-10';
      fixture.componentInstance.guardar();
      fixture.detectChanges();
      expect(d.data.agregarLocal).toHaveBeenCalledWith(jasmine.objectContaining({ direccion: 'Carrera 7 #45-10' }));
      expect(d.toast.exito).toHaveBeenCalledWith('Local creado.');
      expect(el().querySelector('dialog')).toBeNull();
    });

    it('shows the save error inside the modal', () => {
      d.data.agregarLocal.and.returnValue(throwError(() => new Error('500')));
      abrirNuevo();
      fixture.componentInstance.form.direccion = 'Carrera 7 #45-10';
      fixture.componentInstance.guardar();
      fixture.detectChanges();
      expect(el().querySelector('dialog .error-msg')!.textContent).toContain('No se pudo guardar');
    });

    it('opens a clean form after editing and closing with Cancelar', () => {
      boton('Editar').click();
      fixture.detectChanges();
      boton('Cancelar', el().querySelector('dialog')!).click();
      fixture.detectChanges();
      const dialog = abrirNuevo();
      expect(dialog.querySelector('h2')!.textContent).toContain('Nuevo local');
      expect(fixture.componentInstance.form.direccion).toBe('');
    });
  });
});
