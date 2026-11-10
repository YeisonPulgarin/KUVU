import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ADMIN, ARRENDATARIO, AppDoubles, crearDobles, tieneEmoji } from '../shared/testing/app-doubles';
import { MatchMediaStub } from '../../motion/testing/match-media.stub';
import { PagoVariado } from '../../models/index';

const pago = (id: number, tipo: PagoVariado['tipo'], idArrendatario = 2): PagoVariado => ({
  idPagoVariado: id, empresa_id: 1, fechaPago: '2026-10-05', monto: 100000, tipo,
  metodoPago: 'Tarjeta', idArrendatario, idAdministrador: 1, idLocal: 5
});

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let d: AppDoubles;
  let media: MatchMediaStub;
  const el = () => fixture.nativeElement as HTMLElement;

  function crear(usuario = ADMIN): void {
    d = crearDobles(usuario);
    d.data.pagos.set([pago(1, 'Arriendo'), pago(2, 'Multa'), pago(3, 'Otro', 99)]);
    d.data.getEstadisticas = () => signal({
      totalLocales: 4, totalContratos: 3, totalPagos: 3, totalRecaudado: 100000,
      mantenPendientes: 2, mantenUrgentes: 0
    });
    TestBed.configureTestingModule({ imports: [DashboardComponent], providers: d.providers });
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  }

  beforeEach(() => (media = new MatchMediaStub({ reducedMotion: true }).install()));
  afterEach(() => media.restore());

  it('colors payment type badges with the shared mapping (R4.1) and formats dates', () => {
    crear();
    const badges = Array.from(el().querySelectorAll('.panel tbody .badge'));
    expect(badges.map(b => b.textContent!.trim())).toEqual(['Arriendo', 'Multa', 'Otro']);
    expect(badges[0].classList).toContain('badge--info');
    expect(badges[1].classList).toContain('badge--danger');
    expect(badges[2].classList).toContain('badge--neutral');
    expect(el().querySelector('.panel tbody')!.textContent).toContain('05/10/2026');
  });

  it('shows the breadcrumb with the company as the current place', () => {
    crear();
    const nav = el().querySelector('nav.app-breadcrumb')!;
    expect(nav.querySelector('a')).toBeNull();
    expect(nav.querySelector('[aria-current="page"]')!.textContent!.trim()).toBe('Inicio');
  });

  it('uses SVG icons instead of emoji', () => {
    crear();
    expect(tieneEmoji(el().textContent!)).toBeFalse();
    expect(el().querySelectorAll('.quick-btn app-icon svg').length).toBe(5);
  });

  it('shows the tenant only their payments and three shortcuts', () => {
    crear(ARRENDATARIO);
    expect(el().querySelectorAll('.panel tbody .badge').length).toBe(2);
    expect(el().querySelectorAll('.quick-btn').length).toBe(3);
    expect(el().querySelector('.dashboard__rol-badge')!.textContent).toContain('Arrendatario');
  });

  it('shows the indicator figures (final values with reduced motion)', () => {
    crear();
    const valores = Array.from(el().querySelectorAll('.stat-card__value .sr-only')).map(v => v.textContent!.replace(/\s/g, ' ').trim());
    expect(valores[0]).toBe('4');
    expect(valores[1]).toBe('3');
    expect(valores[2]).toContain('100.000');
  });

  it('shows skeletons for indicators and panels while the data loads (R6.3)', () => {
    crear();
    d.data.esperandoDatos.set(true);
    fixture.detectChanges();
    expect(el().querySelectorAll('app-skeleton').length).toBe(2);
    expect(el().querySelector('.stats-grid')).toBeNull();
    expect(el().querySelector('.panel')).toBeNull();
  });

  it('loads the company data on entry', () => {
    crear();
    expect(d.data.cargarTodo).toHaveBeenCalledWith(1);
  });
});
