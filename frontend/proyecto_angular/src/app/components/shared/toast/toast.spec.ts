import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DURACION_MS, MAX_TOASTS, SALIDA_TOAST_MS, ToastService } from './toast.service';
import { ToastHostComponent } from './toast-host.component';
import { MatchMediaStub } from '../../../motion/testing/match-media.stub';

describe('ToastService', () => {
  let service: ToastService;
  let media: MatchMediaStub;

  beforeEach(() => {
    media = new MatchMediaStub({ reducedMotion: true }).install();
    service = TestBed.inject(ToastService);
  });

  afterEach(() => media.restore());

  it('adds success and error toasts in order', () => {
    service.exito('Local eliminado');
    service.error('No se pudo eliminar el contrato.');
    expect(service.toasts().map(t => [t.tipo, t.texto])).toEqual([
      ['exito', 'Local eliminado'],
      ['error', 'No se pudo eliminar el contrato.']
    ]);
  });

  it('closes success after 4 s and errors after 6 s', fakeAsync(() => {
    service.exito('Pago registrado');
    service.error('No pudimos cargar los datos.');
    tick(DURACION_MS.exito);
    expect(service.toasts().map(t => t.tipo)).toEqual(['error']);
    tick(DURACION_MS.error - DURACION_MS.exito);
    expect(service.toasts()).toEqual([]);
  }));

  it('keeps at most three visible: the oldest leaves', fakeAsync(() => {
    for (let i = 1; i <= MAX_TOASTS + 1; i++) service.exito(`Aviso ${i}`);
    expect(service.toasts().map(t => t.texto)).toEqual(['Aviso 2', 'Aviso 3', 'Aviso 4']);
    tick(DURACION_MS.exito);
  }));

  it('closes on demand and ignores unknown ids', fakeAsync(() => {
    const id = service.exito('Usuario guardado');
    service.cerrar(999);
    service.cerrar(id);
    expect(service.toasts()).toEqual([]);
    tick(DURACION_MS.exito);
  }));

  it('marks the toast as leaving before removing it when motion is allowed', fakeAsync(() => {
    media.set('reducedMotion', false);
    const id = service.exito('Contrato guardado');
    service.cerrar(id);
    expect(service.toasts()[0].saliendo).toBeTrue();
    tick(SALIDA_TOAST_MS);
    expect(service.toasts()).toEqual([]);
  }));
});

describe('ToastHostComponent', () => {
  let fixture: ComponentFixture<ToastHostComponent>;
  let service: ToastService;
  let media: MatchMediaStub;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    media = new MatchMediaStub({ reducedMotion: true }).install();
    fixture = TestBed.createComponent(ToastHostComponent);
    service = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  afterEach(() => {
    media.restore();
    service.ngOnDestroy();
  });

  it('is a polite live region', () => {
    expect(el().querySelector('.toast-region')!.getAttribute('aria-live')).toBe('polite');
  });

  it('renders success as status and error as alert, with icon and text', () => {
    service.exito('Local eliminado');
    service.error('No se pudo eliminar el local.');
    fixture.detectChanges();
    const [ok, ko] = Array.from(el().querySelectorAll<HTMLElement>('.toast'));
    expect(ok.classList).toContain('toast--exito');
    expect(ok.getAttribute('role')).toBe('status');
    expect(ok.textContent).toContain('Local eliminado');
    expect(ko.classList).toContain('toast--error');
    expect(ko.getAttribute('role')).toBe('alert');
    expect(ko.querySelector('app-icon svg')).not.toBeNull();
  });

  it('closes a toast from its close button', () => {
    service.exito('Local eliminado');
    fixture.detectChanges();
    const cerrar = el().querySelector<HTMLButtonElement>('.toast__close')!;
    expect(cerrar.getAttribute('aria-label')).toBe('Cerrar aviso');
    cerrar.click();
    fixture.detectChanges();
    expect(el().querySelector('.toast')).toBeNull();
  });
});
