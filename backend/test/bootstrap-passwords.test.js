const test = require('node:test');
const assert = require('node:assert');

const { createFakeDb } = require('./helpers/fake-db');
const { bootstrapPasswords } = require('../scripts/bootstrap-passwords');
const { verifyPassword } = require('../auth/password');

function seed() {
  const db = createFakeDb();
  const a = db.addUsuario({ empresa_id: 1, nombre: 'A', documento: '1012345678', correo: 'a@k.co', idRol: 1 });
  const b = db.addUsuario({ empresa_id: 1, nombre: 'B', documento: ' 87654321 ', correo: 'b@k.co', idRol: 2 });
  const c = db.addUsuario({
    empresa_id: 2, nombre: 'C', documento: '555', correo: 'c@k.co', idRol: 2,
    password_hash: '$2b$04$existingexistingexistingexistingexistingexistingexist', debe_cambiar_password: 0,
  });
  return { db, a, b, c };
}

test('gives each user without a hash their document as a temporary password', async () => {
  const { db, a, b } = seed();

  const r = await bootstrapPasswords(db);

  assert.deepStrictEqual(r, { pendientes: 2, actualizados: 2 });
  assert.strictEqual(a.debe_cambiar_password, 1);
  assert.strictEqual(b.debe_cambiar_password, 1);
  assert.strictEqual(await verifyPassword('1012345678', a.password_hash), true);
  assert.strictEqual(await verifyPassword('87654321', b.password_hash), true, 'document is trimmed');
});

test('leaves users that already have a hash untouched', async () => {
  const { db, c } = seed();
  const before = { ...c };

  await bootstrapPasswords(db);

  assert.deepStrictEqual(c, before);
});

test('a second run changes nothing', async () => {
  const { db, a } = seed();
  await bootstrapPasswords(db);
  const hash = a.password_hash;

  const r = await bootstrapPasswords(db);

  assert.deepStrictEqual(r, { pendientes: 0, actualizados: 0 });
  assert.strictEqual(a.password_hash, hash);
});

test('does not change any existing column', async () => {
  const { db, a } = seed();
  const { nombre, documento, correo, empresa_id, idRol, telefono } = a;

  await bootstrapPasswords(db);

  assert.deepStrictEqual(
    { nombre: a.nombre, documento: a.documento, correo: a.correo, empresa_id: a.empresa_id, idRol: a.idRol, telefono: a.telefono },
    { nombre, documento, correo, empresa_id, idRol, telefono }
  );
});
