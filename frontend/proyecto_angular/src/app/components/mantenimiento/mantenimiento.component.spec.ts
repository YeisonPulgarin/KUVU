import { ComponentFixture, TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { MantenimientoComponent } from './mantenimiento.component';
import { ADMIN, ARRENDATARIO, AppDoubles, crearDobles, esperar, tieneEmoji } from '../shared/testing/app-doubles';
import { MatchMediaStub } from '../../motion/testing/match-media.stub';
import { Mantenimiento } from '../../models/index';

const PENDIENTE: Mantenimiento = {
  idMantenimiento: 4, empresa_id: 1, idLocal: 5, idArrendatario: 2, tipoMantenimiento: 'Plomería',
  descripcion: 'Fuga en el baño', prioridad: 'urgente', estado: 'pendiente', idAdministrador: 1,
  fecha_creacion: '2026-10-20T10:00:00.000Z'
};
const EN_PROCESO: Mantenimiento = { ...PENDIENTE, idMantenimiento: 6, tipoMantenimiento: 'Electricidad', prioridad: 'baja', estado: 'en_proceso' };

describe('MantenimientoComponent', () => {
  let fixture: ComponentFixture<MantenimientoComponent>;
  let d: AppDoubles;
  let media: MatchMediaStub;
  const el = () => fixture.nativeElement as HTMLElement;
  const tarjeta = (tipo: string) =>
    Array.from(el().querySelectorAll('.mant-card')).find(c => c.textContent!.includes(tipo))!;
  const boton = (raiz: ParentNode, texto: string) =>
    Array.from(raiz.querySelectorAll<HTMLButtonElement>('button')).find(b => b.textContent!.trim() === texto);

  function crear(usuario = ADMIN): void {
    d = crearDobles(usuario);
    d.data.mantenimientos.set([PENDIENTE, EN_PROCESO]);
    d.data.locales.set([{ idLocal: 5, empresa_id: 1, direccion: 'Calle 10 #20-30', idAdministrador: 1 }]);
    d.data.contratos.set([{ idContrato: 9, empresa_id: 1, fechaInicio: '2026-01-01', fechaFin: '2099-12-31', idLocal: 5, idArrendatario: 2, idAdministrador: 1 }]);
    TestBed.configureTestingModule({ imports: [MantenimientoComponent], providers: d.providers });
    fixture = TestBed.createComponent(MantenimientoComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  }

  beforeEach(() => (media = new MatchMediaStub({ reducedMotion: true }).install()));

  afterEach(() => {
    media.restore();
    fixture.destroy();
    (fixture.nativeElement as HTMLElement).remove();
  });

  it('maps every action to its semantic role (R1.3, R10)', () => {
    crear();
    const pendiente = tarjeta('Plomería');
    expect(boton(pendiente, 'Iniciar')!.classList).toContain('btn-action--info');
    expect(boton(pendiente, 'Cancelar solicitud')!.classList).toContain('btn-action--danger');
    expect(pendiente.querySelector('button[aria-label="Eliminar Plomería"]')!.classList).toContain('btn-action--danger');
    expect(boton(tarjeta('Electricidad'), 'Completar')!.classList).toContain('btn-action--success');
  });

  it('shows readable badges: urgent as danger, low as neutral, status labels without underscores', () => {
    crear();
    const badges = (tipo: string) => Array.from(tarjeta(tipo).querySelectorAll('.badge'));
    expect(badges('Plomería').map(b => b.textContent!.trim())).toEqual(['Urgente', 'Pendiente']);
    expect(badges('Plomería')[0].classList).toContain('badge--danger');
    expect(badges('Electricidad').map(b => b.textContent!.trim())).toEqual(['Baja', 'En proceso']);
    expect(badges('Electricidad')[0].classList).toContain('badge--neutral');
    expect(tarjeta('Plomería').textContent).toContain('20/10/2026');
    expect(tieneEmoji(el().textContent!)).toBeFalse();
  });

  it('changes the status with a toast, and reports failures', () => {
    crear();
    boton(tarjeta('Plomería'), 'Iniciar')!.click();
    expect(d.data.actualizarEstadoMantenimiento).toHaveBeenCalledWith(4, 'en_proceso', 1);
    expect(d.toast.exito).toHaveBeenCalledWith('Plomería: iniciado.');

    d.data.actualizarEstadoMantenimiento.and.returnValue(throwError(() => new Error('500')));
    boton(tarjeta('Electricidad'), 'Completar')!.click();
    expect(d.toast.error).toHaveBeenCalledWith(jasmine.stringContaining('No se pudo actualizar "Electricidad"'));
  });

  it('asks with a danger confirmation before cancelling a request', async () => {
    crear();
    d.confirm.confirmar.and.resolveTo(false);
    boton(tarjeta('Plomería'), 'Cancelar solicitud')!.click();
    await esperar();
    expect(d.confirm.confirmar).toHaveBeenCalledWith(jasmine.objectContaining({
      variante: 'danger', mensaje: jasmine.stringContaining('Plomería')
    }));
    expect(d.data.actualizarEstadoMantenimiento).not.toHaveBeenCalled();

    d.confirm.confirmar.and.resolveTo(true);
    boton(tarjeta('Plomería'), 'Cancelar solicitud')!.click();
    await esperar();
    expect(d.data.actualizarEstadoMantenimiento).toHaveBeenCalledWith(4, 'cancelado', 1);
    expect(d.toast.exito).toHaveBeenCalledWith('Plomería: cancelado.');
  });

  it('deletes after confirmation with a toast, and reports a rejected delete', async () => {
    crear();
    tarjeta('Plomería').querySelector<HTMLButtonElement>('button[aria-label="Eliminar Plomería"]')!.click();
    await esperar();
    expect(d.data.eliminarMantenimiento).toHaveBeenCalledWith(4, 1);
    expect(d.toast.exito).toHaveBeenCalledWith('"Plomería" eliminado.');

    d.data.eliminarMantenimiento.and.returnValue(throwError(() => new Error('500')));
    tarjeta('Plomería').querySelector<HTMLButtonElement>('button[aria-label="Eliminar Plomería"]')!.click();
    await esperar();
    expect(d.toast.error).toHaveBeenCalledWith(jasmine.stringContaining('No se pudo eliminar "Plomería"'));
  });

  it('gives the tenant no status or delete actions', () => {
    crear(ARRENDATARIO);
    expect(el().querySelector('.mant-card__actions')).toBeNull();
    expect(boton(el(), 'Solicitar mantenimiento')).toBeDefined();
  });

  it('opens a clean form after a previous one was closed with Escape (R4.2)', () => {
    crear();
    boton(el(), 'Nuevo mantenimiento')!.click();
    fixture.detectChanges();
    fixture.componentInstance.form.tipoMantenimiento = 'Pintura';
    el().querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();
    expect(el().querySelector('dialog')).toBeNull();

    boton(el(), 'Nuevo mantenimiento')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.form.tipoMantenimiento).toBe('');
  });

  it('validates required fields, then sends the tenant request with a toast', () => {
    crear(ARRENDATARIO);
    boton(el(), 'Solicitar mantenimiento')!.click();
    fixture.detectChanges();
    fixture.componentInstance.guardar();
    fixture.detectChanges();
    expect(el().querySelector('dialog .error-msg')!.textContent).toContain('Completa');
    expect(el().querySelector('#mant-tipo')!.getAttribute('aria-invalid')).toBe('true');

    Object.assign(fixture.componentInstance.form, { idLocal: 5, tipoMantenimiento: 'Pintura', descripcion: 'Pared' });
    fixture.componentInstance.guardar();
    fixture.detectChanges();
    expect(d.data.agregarMantenimiento).toHaveBeenCalledWith(jasmine.objectContaining({ idArrendatario: 2, idAdministrador: 1 }));
    expect(d.toast.exito).toHaveBeenCalledWith('Solicitud enviada.');
    expect(el().querySelector('dialog')).toBeNull();
  });
});
