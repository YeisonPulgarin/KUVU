const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');

const { createFakeDb } = require('./helpers/fake-db');
const {
  verificarCredenciales,
  respuestaLogin,
  MAX_INTENTOS,
  BLOQUEO_MS,
} = require('../auth/credentials');

// Cost 4 keeps the suite fast; bcrypt verifies any cost.
const HASH = bcrypt.hashSync('Tejado#Azul42', 4);
const T0 = Date.parse('2026-11-09T12:00:00Z');

function setup(t, overrides = {}) {
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'error', () => {});
  t.mock.timers.enable({ apis: ['Date'], now: T0 });
  const db = createFakeDb();
  const user = db.addUsuario({
    empresa_id: 2, nombre: 'Ana', documento: '1128074279', correo: 'ana@kuvu.co', idRol: 2,
    password_hash: HASH, ...overrides,
  });
  return { db, user };
}

const creds = (over = {}) => ({
  correo: 'ana@kuvu.co', documento: '1128074279', password: 'Tejado#Azul42', empresa_id: 2, ...over,
});

test('accepts full valid credentials', async (t) => {
  const { db, user } = setup(t);

  const r = await verificarCredenciales(db, creds());

  assert.strictEqual(r.estado, 'ok');
  assert.strictEqual(r.usuario.idUsuario, user.idUsuario);
});

test('trims e-mail and document before comparing', async (t) => {
  const { db } = setup(t);

  const r = await verificarCredenciales(db, creds({ correo: ' ana@kuvu.co ', documento: ' 1128074279 ' }));

  assert.strictEqual(r.estado, 'ok');
});

test('reports a required change for a temporary password', async (t) => {
  const { db } = setup(t, { debe_cambiar_password: 1 });

  const r = await verificarCredenciales(db, creds());

  assert.strictEqual(r.estado, 'cambio_requerido');
});

for (const [name, over] of [
  ['wrong password', { password: 'Otra#Clave99' }],
  ['wrong document', { documento: '999' }],
]) {
  test(`rejects a ${name} and counts the failure`, async (t) => {
    const { db, user } = setup(t);

    const r = await verificarCredenciales(db, creds(over));

    assert.strictEqual(r.estado, 'rechazado');
    assert.strictEqual(r.motivo, 'credenciales');
    assert.strictEqual(user.intentos_fallidos, 1);
  });
}

test('rejects an unknown account without touching any row', async (t) => {
  const { db, user } = setup(t);

  const r = await verificarCredenciales(db, creds({ correo: 'nadie@kuvu.co' }));

  assert.deepStrictEqual(r, { estado: 'rechazado', motivo: 'credenciales' });
  assert.strictEqual(user.intentos_fallidos, 0);
  assert.ok(db.calls.every((c) => !/^\s*UPDATE/i.test(c.sql)));
});

test('rejects the right e-mail in another company', async (t) => {
  const { db } = setup(t);

  const r = await verificarCredenciales(db, creds({ empresa_id: 1 }));

  assert.strictEqual(r.estado, 'rechazado');
});

test('rejects an inactive company', async (t) => {
  const { db } = setup(t, { empresa_id: 3 });

  const r = await verificarCredenciales(db, creds({ empresa_id: 3 }));

  assert.strictEqual(r.estado, 'rechazado');
});

test('rejects an account without a hash and counts the failure', async (t) => {
  const { db, user } = setup(t, { password_hash: null });

  const r = await verificarCredenciales(db, creds());

  assert.strictEqual(r.motivo, 'sin_hash');
  assert.strictEqual(user.intentos_fallidos, 1);
});

test(`locks the account for 15 minutes after ${MAX_INTENTOS} failures`, async (t) => {
  const { db, user } = setup(t);

  for (let i = 0; i < MAX_INTENTOS; i++) {
    await verificarCredenciales(db, creds({ password: 'Mala#Clave1' }));
  }

  assert.strictEqual(new Date(user.bloqueado_hasta).getTime(), T0 + BLOQUEO_MS);
  assert.strictEqual(user.intentos_fallidos, 0);
});

test('rejects even the right credentials while locked, without extending the lock', async (t) => {
  const { db, user } = setup(t, { bloqueado_hasta: new Date(T0 + 60_000) });

  const r = await verificarCredenciales(db, creds());

  assert.strictEqual(r.motivo, 'bloqueada');
  assert.strictEqual(new Date(user.bloqueado_hasta).getTime(), T0 + 60_000);
  assert.ok(db.calls.every((c) => !/^\s*UPDATE/i.test(c.sql)));
});

test('accepts again once the lock expires, and clears the lock', async (t) => {
  const { db, user } = setup(t);
  for (let i = 0; i < MAX_INTENTOS; i++) {
    await verificarCredenciales(db, creds({ password: 'Mala#Clave1' }));
  }

  t.mock.timers.tick(BLOQUEO_MS - 1);
  assert.strictEqual((await verificarCredenciales(db, creds())).motivo, 'bloqueada');

  t.mock.timers.tick(1);
  const r = await verificarCredenciales(db, creds());

  assert.strictEqual(r.estado, 'ok');
  assert.strictEqual(user.bloqueado_hasta, null);
});

test('a success resets the failure counter', async (t) => {
  const { db, user } = setup(t, { intentos_fallidos: 3 });

  await verificarCredenciales(db, creds());

  assert.strictEqual(user.intentos_fallidos, 0);
});

test('failures stay separate per account', async (t) => {
  const { db, user } = setup(t);
  const other = db.addUsuario({
    empresa_id: 2, nombre: 'Luis', documento: '555', correo: 'luis@kuvu.co', idRol: 2, password_hash: HASH,
  });

  await verificarCredenciales(db, creds({ password: 'Mala#Clave1' }));

  assert.strictEqual(user.intentos_fallidos, 1);
  assert.strictEqual(other.intentos_fallidos, 0);
});

test('the login payload never carries the hash or the lock state', async (t) => {
  const { db } = setup(t);

  const r = await verificarCredenciales(db, creds());
  const json = JSON.stringify(respuestaLogin(r.usuario));

  assert.doesNotMatch(json, /password_hash|\$2[aby]\$|intentos_fallidos|bloqueado_hasta|debe_cambiar/);
});

test('every rejection path runs exactly one bcrypt verification (no timing shortcut)', async (t) => {
  const passwordModule = require('../auth/password');
  const { db, user } = setup(t);
  const verify = t.mock.method(passwordModule, 'verifyPassword');

  const casos = [
    () => verificarCredenciales(db, creds({ correo: 'nadie@kuvu.co' })),
    () => verificarCredenciales(db, creds({ documento: '000' })),
    () => verificarCredenciales(db, creds({ password: 'Mala#Clave1' })),
    async () => {
      user.bloqueado_hasta = new Date(T0 + 60_000);
      const r = await verificarCredenciales(db, creds());
      user.bloqueado_hasta = null;
      return r;
    },
    async () => {
      user.password_hash = null;
      const r = await verificarCredenciales(db, creds());
      user.password_hash = HASH;
      return r;
    },
  ];

  for (const caso of casos) {
    const before = verify.mock.callCount();
    const r = await caso();
    assert.strictEqual(r.estado, 'rechazado');
    assert.strictEqual(verify.mock.callCount() - before, 1);
  }
});

