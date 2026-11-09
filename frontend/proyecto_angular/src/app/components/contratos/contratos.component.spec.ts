import { ComponentFixture, TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { ContratosComponent } from './contratos.component';
import { ADMIN, ARRENDATARIO, AppDoubles, crearDobles, esperar, tieneEmoji } from '../shared/testing/app-doubles';
import { MatchMediaStub } from '../../motion/testing/match-media.stub';
import { ContratoArrendamiento } from '../../models/index';

const CONTRATO: ContratoArrendamiento = {
  idContrato: 9, empresa_id: 1, fechaInicio: '2026-01-01', fechaFin: '2099-12-31',
  condiciones: 'Pago el día 5', idLocal: 5, idArrendatario: 2, idAdministrador: 1
};

describe('ContratosComponent', () => {
  let fixture: ComponentFixture<ContratosComponent>;
  let d: AppDoubles;
  let media: MatchMediaStub;
  const el = () => fixture.nativeElement as HTMLElement;
  const boton = (texto: string, raiz: ParentNode = el()) =>
    Array.from(raiz.querySelectorAll<HTMLButtonElement>('button')).find(b => b.textContent!.trim() === texto);

  function crear(usuario = ADMIN): void {
    d = crearDobles(usuario);
    d.data.contratos.set([CONTRATO]);
    d.data.locales.set([{ idLocal: 5, empresa_id: 1, direccion: 'Calle 10 #20-30', idAdministrador: 1 }]);
    TestBed.configureTestingModule({ imports: [ContratosComponent], providers: d.providers });
    fixture = TestBed.createComponent(ContratosComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  }

  beforeEach(() => (media = new MatchMediaStub({ reducedMotion: true }).install()));

  afterEach(() => {
    media.restore();
    fixture.destroy();
    (fixture.nativeElement as HTMLElement).remove();
  });

  it('shows dates as dd/mm/aaaa and validity as a semantic badge, without emoji', () => {
    crear();
    const fila = el().querySelector('tbody tr')!;
    expect(fila.textContent).toContain('01/01/2026');
    expect(fila.querySelector('.badge')!.classList).toContain('badge--success');
    expect(tieneEmoji(el().querySelector('h1')!.textContent!)).toBeFalse();
    expect(el().querySelector('[aria-current="page"]')!.textContent!.trim()).toBe('Contratos');
  });

  it('gives the tenant a read-only view: no create, edit or delete', () => {
    crear(ARRENDATARIO);
    expect(boton('Nuevo contrato')).toBeUndefined();
    expect(boton('Editar')).toBeUndefined();
    expect(boton('Eliminar')).toBeUndefined();
    expect(el().querySelector('[aria-current="page"]')!.textContent!.trim()).toBe('Mi contrato');
  });

  it('deletes after a danger confirmation naming the contract, with a success toast', async () => {
    crear();
    expect(boton('Eliminar')!.classList).toContain('btn-action--danger');
    boton('Eliminar')!.click();
    await esperar();
    expect(d.confirm.confirmar).toHaveBeenCalledWith(jasmine.objectContaining({
      variante: 'danger',
      mensaje: jasmine.stringMatching(/#9 .*Carlos Lesmes.*Calle 10 #20-30/)
    }));
    expect(d.data.eliminarContrato).toHaveBeenCalledWith(9, 1);
    expect(d.toast.exito).toHaveBeenCalledWith('Contrato #9 eliminado.');
  });

  it('cancelling the confirmation does not call the API', async () => {
    crear();
    d.confirm.confirmar.and.resolveTo(false);
    boton('Eliminar')!.click();
    await esperar();
    expect(d.data.eliminarContrato).not.toHaveBeenCalled();
  });

  it('reports a rejected delete with an error toast and keeps the row', async () => {
    crear();
    d.data.eliminarContrato.and.returnValue(throwError(() => new Error('fk')));
    boton('Eliminar')!.click();
    await esperar();
    fixture.detectChanges();
    expect(d.toast.error).toHaveBeenCalledWith(jasmine.stringContaining('pagos asociados'));
    expect(el().querySelectorAll('tbody tr').length).toBe(1);
  });

  it('opens "Nuevo contrato" empty after editing and closing by the backdrop (R4.2)', () => {
    crear();
    boton('Editar')!.click();
    fixture.detectChanges();
    const dialog = el().querySelector('dialog')!;
    expect(dialog.querySelector('h2')!.textContent).toContain('Editar contrato');
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(el().querySelector('dialog')).toBeNull();

    boton('Nuevo contrato')!.click();
    fixture.detectChanges();
    expect(el().querySelector('dialog h2')!.textContent).toContain('Nuevo contrato');
    expect(fixture.componentInstance.form.idContrato).toBeUndefined();
    expect(fixture.componentInstance.form.condiciones).toBe('');
  });

  it('validates required fields and the date order inside the modal', () => {
    crear();
    boton('Nuevo contrato')!.click();
    fixture.detectChanges();
    fixture.componentInstance.guardar();
    fixture.detectChanges();
    expect(el().querySelector('dialog .error-msg')!.textContent).toContain('Completa');
    expect(el().querySelector('#contrato-local')!.getAttribute('aria-invalid')).toBe('true');

    Object.assign(fixture.componentInstance.form, {
      idLocal: 5, idArrendatario: 2, fechaInicio: '2026-05-01', fechaFin: '2026-01-01'
    });
    fixture.componentInstance.guardar();
    fixture.detectChanges();
    expect(el().querySelector('dialog .error-msg')!.textContent).toContain('anterior');
    expect(d.data.agregarContrato).not.toHaveBeenCalled();
  });

  it('saves an edit with a success toast and closes the modal', () => {
    crear();
    boton('Editar')!.click();
    fixture.detectChanges();
    fixture.componentInstance.guardar();
    fixture.detectChanges();
    expect(d.data.actualizarContrato).toHaveBeenCalledWith(9, jasmine.objectContaining({ idLocal: 5 }));
    expect(d.toast.exito).toHaveBeenCalledWith('Contrato actualizado.');
    expect(el().querySelector('dialog')).toBeNull();
  });
});
