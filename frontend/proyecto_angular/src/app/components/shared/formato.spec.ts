import { formatFecha, formatMoneda } from './formato';

describe('formato', () => {
  it('formats API dates as dd/mm/aaaa keeping the stored day', () => {
    expect(formatFecha('2026-03-05')).toBe('05/03/2026');
    expect(formatFecha('2026-03-05T00:00:00.000Z')).toBe('05/03/2026');
  });

  it('returns a dash for empty dates and unknown formats unchanged', () => {
    expect(formatFecha(null)).toBe('—');
    expect(formatFecha('')).toBe('—');
    expect(formatFecha('mañana')).toBe('mañana');
  });

  it('formats Colombian pesos without decimals', () => {
    const texto = formatMoneda(1500000).replace(/\s/g, ' ');
    expect(texto).toContain('1.500.000');
    expect(texto).toContain('$');
    expect(formatMoneda('2500')).toContain('2.500');
    expect(formatMoneda(null)).toContain('0');
  });
});
