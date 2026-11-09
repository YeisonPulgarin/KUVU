import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DataService } from './data.service';

const API = 'http://localhost:3000/api';
const ENTIDADES = ['usuarios', 'locales', 'contratos', 'mantenimiento', 'pagos'];

describe('DataService', () => {
  let service: DataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function responderCarga(empresaId: number, contratos: unknown[] = []): void {
    for (const entidad of ENTIDADES) {
      http.expectOne(`${API}/${entidad}?empresa_id=${empresaId}`)
        .flush(entidad === 'contratos' ? contratos : []);
    }
  }

  describe('load state', () => {
    it('waits for data until the first load succeeds', () => {
      expect(service.listo()).toBeFalse();
      expect(service.esperandoDatos()).toBeTrue();

      service.cargarTodo(1).subscribe();
      expect(service.cargando()).toBeTrue();
      responderCarga(1);

      expect(service.cargando()).toBeFalse();
      expect(service.listo()).toBeTrue();
      expect(service.esperandoDatos()).toBeFalse();
    });

    it('stays ready while refreshing the same company, but not for another company', () => {
      service.cargarTodo(1).subscribe();
      responderCarga(1);

      service.cargarTodo(1).subscribe();
      expect(service.listo()).toBeTrue();
      responderCarga(1);

      service.cargarTodo(2).subscribe();
      expect(service.listo()).toBeFalse();
      responderCarga(2);
      expect(service.listo()).toBeTrue();
    });

    it('stops loading and reports the error when the load fails', () => {
      let fallo = false;
      service.cargarTodo(1).subscribe({ error: () => (fallo = true) });
      http.expectOne(`${API}/usuarios?empresa_id=1`).flush('boom', { status: 500, statusText: 'Error' });
      // forkJoin cancels the other requests after the first error.
      ENTIDADES.slice(1).forEach(e => http.match(`${API}/${e}?empresa_id=1`));

      expect(fallo).toBeTrue();
      expect(service.cargando()).toBeFalse();
      expect(service.errorCarga()).toBeTrue();
      expect(service.esperandoDatos()).toBeFalse();
    });

    it('clears the error on the next load', () => {
      service.cargarTodo(1).subscribe({ error: () => undefined });
      http.expectOne(`${API}/usuarios?empresa_id=1`).flush('boom', { status: 500, statusText: 'Error' });
      ENTIDADES.slice(1).forEach(e => http.match(`${API}/${e}?empresa_id=1`));

      service.cargarTodo(1).subscribe();
      expect(service.errorCarga()).toBeFalse();
      responderCarga(1);
    });
  });

  describe('deletes', () => {
    it('deletes a contract and reloads the contracts of the company', () => {
      let ok = false;
      service.eliminarContrato(7, 3).subscribe(() => (ok = true));
      const req = http.expectOne(`${API}/contratos/7`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ ok: true });
      http.expectOne(`${API}/contratos?empresa_id=3`).flush([{ idContrato: 8 }]);

      expect(ok).toBeTrue();
      expect(service.getContratos()().map(c => c.idContrato)).toEqual([8]);
    });

    it('deletes a maintenance request and reloads the list', () => {
      service.eliminarMantenimiento(4, 3).subscribe();
      const req = http.expectOne(`${API}/mantenimiento/4`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ ok: true });
      http.expectOne(`${API}/mantenimiento?empresa_id=3`).flush([]);
    });

    it('does not reload when the backend rejects the delete', () => {
      let error = false;
      service.eliminarContrato(7, 3).subscribe({ error: () => (error = true) });
      http.expectOne(`${API}/contratos/7`).flush('fk', { status: 500, statusText: 'Error' });
      http.expectNone(`${API}/contratos?empresa_id=3`);
      expect(error).toBeTrue();
    });
  });
});
