import {
  TEXTO_CLARO,
  TEXTO_OSCURO,
  contraste,
  luminancia,
  parseHex,
  textoSobreMarca
} from './color-contrast';

describe('color-contrast', () => {
  it('parses short and long hex colors and rejects anything else', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('#2B4C8C')).toEqual([43, 76, 140]);
    expect(parseHex('rojo')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
  });

  it('computes WCAG luminance and contrast', () => {
    expect(luminancia('#000000')).toBe(0);
    expect(luminancia('#ffffff')).toBeCloseTo(1, 5);
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contraste('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contraste('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  // The four companies stored in the `empresas` table (primary, secondary).
  const empresas: Array<[string, string, string, string]> = [
    ['Amarilo', '#F5A623', '#F0851A', TEXTO_OSCURO],
    ['Nido Rent', '#2C7A7B', '#38A169', TEXTO_CLARO],
    ['Balcones de San Soucci', '#8B4513', '#A0522D', TEXTO_CLARO],
    ['Mi Inmueble', '#2B4C8C', '#3A6FD8', TEXTO_CLARO]
  ];

  for (const [nombre, primario, secundario, esperado] of empresas) {
    it(`picks ${esperado} on the ${nombre} brand (secondary ${secundario})`, () => {
      expect(textoSobreMarca(primario)).toBe(esperado);
    });
  }

  it('reaches AA (4.5:1) on the primary color of every company', () => {
    for (const [, primario, , esperado] of empresas) {
      expect(contraste(esperado, primario)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('falls back to the light label for invalid colors', () => {
    expect(textoSobreMarca(null)).toBe(TEXTO_CLARO);
    expect(textoSobreMarca(undefined)).toBe(TEXTO_CLARO);
    expect(textoSobreMarca('x')).toBe(TEXTO_CLARO);
    expect(textoSobreMarca('#fff')).toBe(TEXTO_OSCURO);
  });
});
