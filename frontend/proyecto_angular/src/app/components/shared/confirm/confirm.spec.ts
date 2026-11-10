import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmService, OpcionesConfirmacion } from './confirm.service';
import { ConfirmHostComponent } from './confirm-host.component';
import { MatchMediaStub } from '../../../motion/testing/match-media.stub';

const borrarLocal: OpcionesConfirmacion = {
  titulo: 'Eliminar local',
  mensaje: '¿Eliminar el local en "Calle 10 #20-30"? Esta acción no se puede deshacer.',
  confirmarTexto: 'Eliminar',
  variante: 'danger'
};

describe('ConfirmService', () => {
  let service: ConfirmService;

  beforeEach(() => {
    service = TestBed.inject(ConfirmService);
  });

  it('exposes the request and resolves with the answer', async () => {
    const respuesta = service.confirmar(borrarLocal);
    expect(service.solicitud()?.titulo).toBe('Eliminar local');
    service.responder(true);
    expect(await respuesta).toBeTrue();
    expect(service.solicitud()).toBeNull();
  });

  it('answers "no" to a pending request when a new one arrives', async () => {
    const primera = service.confirmar(borrarLocal);
    const segunda = service.confirmar({ ...borrarLocal, titulo: 'Cerrar sesión', variante: 'neutral' });
    expect(await primera).toBeFalse();
    expect(service.solicitud()?.titulo).toBe('Cerrar sesión');
    service.responder(false);
    expect(await segunda).toBeFalse();
  });

  it('ignores an answer when nothing is pending', () => {
    expect(() => service.responder(true)).not.toThrow();
  });
});

describe('ConfirmHostComponent', () => {
  let fixture: ComponentFixture<ConfirmHostComponent>;
  let service: ConfirmService;
  let media: MatchMediaStub;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    media = new MatchMediaStub({ reducedMotion: true }).install();
    fixture = TestBed.createComponent(ConfirmHostComponent);
    document.body.appendChild(fixture.nativeElement);
    service = TestBed.inject(ConfirmService);
    fixture.detectChanges();
  });

  afterEach(() => {
    media.restore();
    fixture.destroy();
    (fixture.nativeElement as HTMLElement).remove();
  });

  function pedir(opciones = borrarLocal): Promise<boolean> {
    const respuesta = service.confirmar(opciones);
    fixture.detectChanges();
    return respuesta;
  }

  it('renders nothing without a request', () => {
    expect(el().querySelector('dialog')).toBeNull();
  });

  it('shows title, message naming the item and a danger confirm button, focusing Cancelar', () => {
    pedir();
    const dialog = el().querySelector('dialog')!;
    expect(dialog.open).toBeTrue();
    expect(dialog.querySelector('h2')!.textContent).toContain('Eliminar local');
    expect(dialog.querySelector('.confirm__mensaje')!.textContent).toContain('Calle 10 #20-30');
    const [cancelar, confirmar] = Array.from(dialog.querySelectorAll<HTMLButtonElement>('.modal__footer button'));
    expect(confirmar.classList).toContain('btn-solid--danger');
    expect(confirmar.textContent!.trim()).toBe('Eliminar');
    expect(document.activeElement).toBe(cancelar);
  });

  it('resolves true on confirm and closes', async () => {
    const respuesta = pedir();
    el().querySelectorAll<HTMLButtonElement>('.modal__footer button')[1].click();
    fixture.detectChanges();
    expect(await respuesta).toBeTrue();
    expect(el().querySelector('dialog')).toBeNull();
  });

  it('resolves false on Cancelar, Escape and the close button', async () => {
    let respuesta = pedir();
    el().querySelectorAll<HTMLButtonElement>('.modal__footer button')[0].click();
    expect(await respuesta).toBeFalse();

    respuesta = pedir();
    el().querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(await respuesta).toBeFalse();

    respuesta = pedir();
    el().querySelector<HTMLButtonElement>('.modal__close')!.click();
    expect(await respuesta).toBeFalse();
  });

  it('uses the warning variant for cancelling a request', () => {
    pedir({ ...borrarLocal, variante: 'warning', confirmarTexto: 'Cancelar solicitud' });
    const boton = el().querySelectorAll<HTMLButtonElement>('.modal__footer button')[1];
    expect(boton.classList).toContain('btn-solid--warning');
    expect(el().querySelector('.confirm--warning')).not.toBeNull();
  });
});
