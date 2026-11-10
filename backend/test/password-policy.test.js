const test = require('node:test');
const assert = require('node:assert');

const { validarPassword } = require('../auth/password-policy');

const codigos = (pw, ctx) => validarPassword(pw, ctx).map((r) => r.codigo);

test('accepts a password that meets every rule', () => {
  assert.deepStrictEqual(validarPassword('Tejado#Azul42', { correo: 'ana@kuvu.co', documento: '1128074279' }), []);
});

test('length: 7 and 65 characters fail, 8 and 64 pass', () => {
  assert.ok(codigos('Ab1!xyz').includes('LONGITUD'));
  assert.ok(!codigos('Ab1!xyzw').includes('LONGITUD'));
  const base = 'Ab1!';
  assert.ok(!codigos(base + 'x'.repeat(60)).includes('LONGITUD'));
  assert.ok(codigos(base + 'x'.repeat(61)).includes('LONGITUD'));
});

test('length counts characters, not UTF-16 units', () => {
  // 8 characters, one of them outside the BMP.
  assert.ok(!codigos('Ab1!xyz😀').includes('LONGITUD'));
});

test('rejects more than 72 bytes even within 64 characters', () => {
  const pw = 'Ab1!' + 'ñ'.repeat(40); // 44 characters, 4 + 80 bytes
  const result = codigos(pw);
  assert.ok(result.includes('BYTES'));
  assert.ok(!result.includes('LONGITUD'));
});

test('requires each character class', () => {
  assert.ok(codigos('tejado#azul42').includes('MAYUSCULA'));
  assert.ok(codigos('TEJADO#AZUL42').includes('MINUSCULA'));
  assert.ok(codigos('Tejado#Azul').includes('NUMERO'));
  assert.ok(codigos('TejadoAzul42').includes('SIMBOLO'));
});

test('a space counts as a symbol and accented letters count as letters', () => {
  assert.deepStrictEqual(codigos('Tejado Azul42'), []);
  assert.deepStrictEqual(codigos('Árbol#ñandú7'), []);
});

test('rejects blocklisted passwords regardless of case', () => {
  assert.ok(codigos('Password1!').includes('COMUN'));
  assert.ok(codigos('QWERTY123*').includes('COMUN'));
  assert.ok(codigos('Kuvu2026!').includes('COMUN'));
  assert.ok(codigos('NidoRent2026!').includes('COMUN'));
});

test('rejects a password containing the e-mail or its local part', () => {
  const ctx = { correo: 'Admin1@Gmail.com' };
  assert.ok(codigos('X!admin1@gmail.com9', ctx).includes('CONTIENE_CORREO'));
  assert.ok(codigos('Mi#ADMIN1clave', ctx).includes('CONTIENE_CORREO'));
});

test('ignores a local part shorter than 4 characters', () => {
  assert.ok(!codigos('Tejado#Azul42', { correo: 'ana@kuvu.co' }).includes('CONTIENE_CORREO'));
  assert.ok(!codigos('Ana#Tejado42', { correo: 'ana@kuvu.co' }).includes('CONTIENE_CORREO'));
});

test('rejects a password containing the document', () => {
  assert.ok(codigos('Clave#1128074279', { documento: ' 1128074279 ' }).includes('CONTIENE_DOCUMENTO'));
});

test('rejects reusing the current password', () => {
  assert.ok(codigos('Tejado#Azul42', { actual: 'Tejado#Azul42' }).includes('IGUAL_ACTUAL'));
  assert.ok(!codigos('Tejado#Azul43', { actual: 'Tejado#Azul42' }).includes('IGUAL_ACTUAL'));
});

test('every broken rule carries a Spanish message', () => {
  const reglas = validarPassword('abc');
  assert.ok(reglas.length >= 3);
  for (const r of reglas) assert.ok(typeof r.mensaje === 'string' && r.mensaje.length > 0);
});

test('a non-string value is invalid', () => {
  assert.deepStrictEqual(codigos(undefined), ['LONGITUD']);
});
