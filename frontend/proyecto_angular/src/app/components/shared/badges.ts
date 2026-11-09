/**
 * Readable label and semantic color of the status badges of the signed-in app. The classes
 * are `.badge--{rol}` from shared.styles.scss, painted with the fixed `--sem-*` tokens.
 */
export type RolSemantico = 'danger' | 'success' | 'warning' | 'info' | 'neutral';

export interface Badge {
  clase: `badge--${RolSemantico}`;
  etiqueta: string;
}

const badge = (rol: RolSemantico, etiqueta: string): Badge => ({ clase: `badge--${rol}`, etiqueta });

/** Fallback for a value the app does not know: neutral, label as received. */
const desconocido = (valor: string | null | undefined): Badge => badge('neutral', valor || '—');

const ESTADOS: Record<string, Badge> = {
  pendiente: badge('warning', 'Pendiente'),
  en_proceso: badge('info', 'En proceso'),
  completado: badge('success', 'Completado'),
  cancelado: badge('neutral', 'Cancelado')
};

const PRIORIDADES: Record<string, Badge> = {
  urgente: badge('danger', 'Urgente'),
  normal: badge('info', 'Normal'),
  baja: badge('neutral', 'Baja')
};

const TIPOS_PAGO: Record<string, Badge> = {
  Arriendo: badge('info', 'Arriendo'),
  Multa: badge('danger', 'Multa'),
  Otro: badge('neutral', 'Otro')
};

/** Maintenance request status. */
export function badgeEstado(estado: string | null | undefined): Badge {
  return ESTADOS[estado ?? ''] ?? desconocido(estado);
}

/** Maintenance request priority. */
export function badgePrioridad(prioridad: string | null | undefined): Badge {
  return PRIORIDADES[prioridad ?? ''] ?? desconocido(prioridad);
}

/** Payment type. */
export function badgeTipoPago(tipo: string | null | undefined): Badge {
  return TIPOS_PAGO[tipo ?? ''] ?? desconocido(tipo);
}

/** Contract validity, from its end date (inclusive). */
export function badgeVigencia(vigente: boolean): Badge {
  return vigente ? badge('success', 'Vigente') : badge('danger', 'Vencido');
}
