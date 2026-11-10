const test = require('node:test');
const assert = require('node:assert');

const { hashPassword, verifyPassword, DUMMY_HASH, COST } = require('../auth/password');

test('stores a bcrypt hash, never the password itself', async () => {
  const hash = await hashPassword('Clave$egura9');

  assert.notStrictEqual(hash, 'Clave$egura9');
  assert.doesNotMatch(hash, /Clave\$egura9/);
  assert.match(hash, new RegExp(`^\\$2[aby]\\$${COST}\\$`));
  assert.ok(COST >= 10);
});

test('verifies the right password and rejects any other', async () => {
  const hash = await hashPassword('Clave$egura9');

  assert.strictEqual(await verifyPassword('Clave$egura9', hash), true);
  assert.strictEqual(await verifyPassword('clave$egura9', hash), false);
  assert.strictEqual(await verifyPassword('', hash), false);
});

test('salts every hash: the same password gives different hashes', async () => {
  const [a, b] = await Promise.all([hashPassword('Clave$egura9'), hashPassword('Clave$egura9')]);

  assert.notStrictEqual(a, b);
});

test('rejects missing values without throwing', async () => {
  assert.strictEqual(await verifyPassword(undefined, DUMMY_HASH), false);
  assert.strictEqual(await verifyPassword('x', null), false);
});

test('the dummy hash is a valid hash that matches no common input', async () => {
  assert.strictEqual(await verifyPassword('', DUMMY_HASH), false);
  assert.strictEqual(await verifyPassword('123', DUMMY_HASH), false);
});
