import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { PagosComponent } from './pagos.component';
import { ADMIN, ARRENDATARIO, AppDoubles, crearDobles, esperar, tieneEmoji } from '../shared/testing/app-doubles';
import { MatchMediaStub } from '../../motion/testing/match-media.stub';
import { PagoVariado } from '../../models/index';

const PAGO: PagoVariado = {
  idPagoVariado: 3, empresa_id: 1, fechaPago: '2026-10-05', monto: 1500000, tipo: 'Multa',
  descripcion: 'Retraso', metodoPago: 'Transferencia', idArrendatario: 2, idAdministrador: 1, idLocal: 5
};

describe('PagosComponent', () => {
  let fixture: ComponentFixture<PagosComponent>;
  let d: AppDoubles;
  let media: MatchMediaStub;
  const el = () => fixture.nativeElement as HTMLElement;
  const boton = (texto: string) =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('button')).find(b => b.textContent!.trim().startsWith(texto));

  function crear(usuario = ADMIN): void {
    d = crearDobles(usuario);
    d.data.pagos.set([PAGO]);
    d.data.locales.set([{ idLocal: 5, empresa_id: 1, direccion: 'Calle 10 #20-30', valorArriendo: 1500000, idAdministrador: 1 }]);
    d.data.contratos.set([{ idContrato: 9, empresa_id: 1, fechaInicio: '2026-01-01', fechaFin: '2099-12-31', idLocal: 5, idArrendatario: 2, idAdministrador: 1 }]);
    TestBed.configureTestingModule({ imports: [PagosComponent], providers: d.providers });
    fixture = TestBed.createComponent(PagosComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  }

  beforeEach(() => (media = new MatchMediaStub({ reducedMotion: true }).install()));

  afterEach(() => {
    media.restore();
    fixture.destroy();
    (fixture.nativeElement as HTMLElement).remove();
  });

  it('shows the payment type as a semantic badge, the method with an SVG icon and no emoji', () => {
    crear();
    const fila = el().querySelector('tbody tr')!;
    expect(fila.querySelector('.badge')!.classList).toContain('badge--danger');
    expect(fila.querySelector('.metodo app-icon svg')).not.toBeNull();
    expect(fila.textContent).toContain('05/10/2026');
    expect(tieneEmoji(el().textContent!)).toBeFalse();
  });

  describe('administrator', () => {
    beforeEach(() => crear(ADMIN));

    it('deletes a payment after a danger confirmation, with a success toast', async () => {
      const eliminar = boton('Eliminar')!;
      expect(eliminar.classList).toContain('btn-action--danger');
      eliminar.click();
      await esperar();
      expect(d.confirm.confirmar).toHaveBeenCalledWith(jasmine.objectContaining({
        variante: 'danger', mensaje: jasmine.stringContaining('#3')
      }));
      expect(d.data.eliminarPago).toHaveBeenCalledWith(3, 1);
      expect(d.toast.exito).toHaveBeenCalledWith('Pago #3 eliminado.');
    });

    it('does not delete on cancel and reports a rejected delete', async () => {
      d.confirm.confirmar.and.resolveTo(false);
      boton('Eliminar')!.click();
      await esperar();
      expect(d.data.eliminarPago).not.toHaveBeenCalled();

      d.confirm.confirmar.and.resolveTo(true);
      d.data.eliminarPago.and.returnValue(throwError(() => new Error('500')));
      boton('Eliminar')!.click();
      await esperar();
      expect(d.toast.error).toHaveBeenCalledWith(jasmine.stringContaining('No se pudo eliminar el pago #3'));
    });

    it('has no "Pagar arriendo" button', () => {
      expect(boton('Pagar arriendo')).toBeUndefined();
    });
  });

  describe('tenant', () => {
    beforeEach(() => crear(ARRENDATARIO));

    it('cannot delete payments', () => {
      expect(boton('Eliminar')).toBeUndefined();
    });

    it('registers a single payment on a double click (R4.4) and confirms with a toast', () => {
      const respuesta = new Subject<unknown>();
      d.data.agregarPago.and.returnValue(respuesta);
      boton('Pagar arriendo')!.click();
      fixture.detectChanges();

      const pagar = boton('Ir a pagar')!;
      pagar.click();
      pagar.click();
      fixture.detectChanges();
      expect(d.data.agregarPago).toHaveBeenCalledTimes(1);
      const ocupado = el().querySelector<HTMLButtonElement>('dialog .btn-primary')!;
      expect(ocupado.disabled).toBeTrue();
      expect(ocupado.getAttribute('aria-busy')).toBe('true');

      respuesta.next({ ok: true });
      respuesta.complete();
      fixture.detectChanges();
      expect(d.toast.exito).toHaveBeenCalledWith(jasmine.stringContaining('registrado'));
      expect(el().querySelector('dialog')).toBeNull();
    });

    it('reports a failed payment with an error toast and lets the user retry', () => {
      d.data.agregarPago.and.returnValue(throwError(() => new Error('500')));
      boton('Pagar arriendo')!.click();
      fixture.detectChanges();
      boton('Ir a pagar')!.click();
      fixture.detectChanges();
      expect(d.toast.error).toHaveBeenCalledWith('No se pudo procesar el pago. Intenta de nuevo.');
      expect(boton('Ir a pagar')!.disabled).toBeFalse();
    });

    it('reports the missing contract with an error toast instead of alert()', () => {
      d.data.contratos.set([]);
      fixture.detectChanges();
      spyOn(window, 'alert');
      fixture.componentInstance.confirmarPago();
      expect(d.toast.error).toHaveBeenCalledWith('No tienes un contrato activo para realizar el pago.');
      expect(window.alert).not.toHaveBeenCalled();
    });
  });
});
