/**
 * Display formats of the signed-in app (Colombian Spanish). Dates arrive from the API as
 * `YYYY-MM-DD` or ISO timestamps; the calendar day is kept as stored, without shifting it to
 * the browser time zone.
 */

const FECHA = /^(\d{4})-(\d{2})-(\d{2})/;

/** `2026-03-05` or `2026-03-05T00:00:00.000Z` → `05/03/2026`. Anything else is returned as is. */
export function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return '—';
  const partes = FECHA.exec(fecha);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : fecha;
}

const MONEDA = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0
});

/** Colombian pesos without decimals. */
export function formatMoneda(valor: number | string | null | undefined): string {
  return MONEDA.format(Number(valor ?? 0));
}
