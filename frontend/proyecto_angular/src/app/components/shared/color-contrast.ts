/**
 * WCAG contrast helpers for the company brand colors: the primary button label is dark on
 * light brands and white on dark ones, without touching the stored `color_texto`.
 */

/** Dark label used on light brand colors. */
export const TEXTO_OSCURO = '#1a202c';
/** Light label used on dark brand colors. */
export const TEXTO_CLARO = '#ffffff';

/** Parses `#rgb` or `#rrggbb`; returns null for anything else. */
export function parseHex(hex: string): [number, number, number] | null {
  const value = hex.trim().replace(/^#/, '');
  const full = value.length === 3 ? value.split('').map(c => c + c).join('') : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

/** Relative luminance (WCAG 2.x) of a hex color, from 0 (black) to 1 (white). */
export function luminancia(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(channel => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two hex colors, from 1 to 21. */
export function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

/**
 * Label color for a surface painted with the company brand: the candidate with the highest
 * contrast against the primary color. The primary button is a primary→secondary gradient, but
 * the secondary is often a lighter companion (Nido Rent: teal → green) and judging by the
 * worst stop would flip a readable white label to dark. An invalid primary yields the light
 * label.
 */
export function textoSobreMarca(primario: string | null | undefined): string {
  if (!primario || parseHex(primario) === null) return TEXTO_CLARO;
  return contraste(TEXTO_OSCURO, primario) > contraste(TEXTO_CLARO, primario)
    ? TEXTO_OSCURO
    : TEXTO_CLARO;
}
