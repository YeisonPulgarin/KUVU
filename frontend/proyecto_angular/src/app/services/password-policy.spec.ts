import { cumplePolitica, evaluarPassword } from './password-policy';

describe('password-policy', () => {
  const fallas = (pw: string, ctx = {}) =>
    evaluarPassword(pw, ctx).filter((r) => !r.cumple).map((r) => r.codigo);

  it('accepts a password that meets every local rule', () => {
    expect(cumplePolitica('Tejado#Azul42', { correo: 'ana@kuvu.co', documento: '1128074279' })).toBeTrue();
  });

  it('checks length limits: 7 and 65 fail, 8 and 64 pass', () => {
    expect(fallas('Ab1!xyz')).toContain('LONGITUD');
    expect(fallas('Ab1!xyzw')).not.toContain('LONGITUD');
    expect(fallas('Ab1!' + 'x'.repeat(60))).not.toContain('LONGITUD');
    expect(fallas('Ab1!' + 'x'.repeat(61))).toContain('LONGITUD');
  });

  it('fails the length rule over 72 bytes', () => {
    expect(fallas('Ab1!' + 'ñ'.repeat(40))).toContain('LONGITUD');
  });

  it('requires each character class', () => {
    expect(fallas('tejado#azul42')).toContain('MAYUSCULA');
    expect(fallas('TEJADO#AZUL42')).toContain('MINUSCULA');
    expect(fallas('Tejado#Azul')).toContain('NUMERO');
    expect(fallas('TejadoAzul42')).toContain('SIMBOLO');
  });

  it('rejects the e-mail, its local part (4+ chars) or the document', () => {
    expect(fallas('Mi#Admin1clave', { correo: 'admin1@gmail.com' })).toContain('CONTIENE_DATOS');
    expect(fallas('Clave#1128074279', { documento: '1128074279' })).toContain('CONTIENE_DATOS');
    expect(fallas('Ana#Tejado42', { correo: 'ana@kuvu.co' })).not.toContain('CONTIENE_DATOS');
  });

  it('adds the "different from current" rule only when the current one is known', () => {
    expect(evaluarPassword('Tejado#Azul42').some((r) => r.codigo === 'IGUAL_ACTUAL')).toBeFalse();
    expect(fallas('Tejado#Azul42', { actual: 'Tejado#Azul42' })).toContain('IGUAL_ACTUAL');
  });

  it('an empty password meets nothing', () => {
    expect(cumplePolitica('')).toBeFalse();
    expect(fallas('')).toContain('CONTIENE_DATOS');
  });
});
