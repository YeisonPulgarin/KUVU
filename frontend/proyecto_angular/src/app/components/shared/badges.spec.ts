import { badgeEstado, badgePrioridad, badgeTipoPago, badgeVigencia } from './badges';

describe('badges', () => {
  it('maps maintenance status to readable labels and semantic roles', () => {
    expect(badgeEstado('pendiente')).toEqual({ clase: 'badge--warning', etiqueta: 'Pendiente' });
    expect(badgeEstado('en_proceso')).toEqual({ clase: 'badge--info', etiqueta: 'En proceso' });
    expect(badgeEstado('completado')).toEqual({ clase: 'badge--success', etiqueta: 'Completado' });
    expect(badgeEstado('cancelado')).toEqual({ clase: 'badge--neutral', etiqueta: 'Cancelado' });
  });

  it('maps priority: urgent is danger and low is neutral, never green', () => {
    expect(badgePrioridad('urgente')).toEqual({ clase: 'badge--danger', etiqueta: 'Urgente' });
    expect(badgePrioridad('normal')).toEqual({ clase: 'badge--info', etiqueta: 'Normal' });
    expect(badgePrioridad('baja')).toEqual({ clase: 'badge--neutral', etiqueta: 'Baja' });
  });

  it('maps payment types (the dashboard and /pagos share it)', () => {
    expect(badgeTipoPago('Arriendo').clase).toBe('badge--info');
    expect(badgeTipoPago('Multa').clase).toBe('badge--danger');
    expect(badgeTipoPago('Otro').clase).toBe('badge--neutral');
  });

  it('falls back to a neutral badge with the raw value for unknown input', () => {
    expect(badgeEstado('archivado')).toEqual({ clase: 'badge--neutral', etiqueta: 'archivado' });
    expect(badgeTipoPago(undefined)).toEqual({ clase: 'badge--neutral', etiqueta: '—' });
  });

  it('maps contract validity', () => {
    expect(badgeVigencia(true)).toEqual({ clase: 'badge--success', etiqueta: 'Vigente' });
    expect(badgeVigencia(false)).toEqual({ clase: 'badge--danger', etiqueta: 'Vencido' });
  });
});
