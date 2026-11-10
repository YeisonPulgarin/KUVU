const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');

const { createFakeDb } = require('./helpers/fake-db');
const { installFakeDb, startApp, post } = require('./helpers/route-harness');

const fakeDb = createFakeDb();
installFakeDb(fakeDb);

const router = require('../routes/usuarios');
const { MENSAJE_ACCESO } = require('../auth/credentials');
const { verifyPassword } = require('../auth/password');

const HASH_ADMIN = bcrypt.hashSync('Admin$Seguro1', 4);
const HASH_USER = bcrypt.hashSync('Tejado#Azul42', 4);
const ADMIN = { correo: 'jefe@kuvu.co', documento: '100', password: 'Admin$Seguro1', empresa_id: 2 };

let app;
let admin;
let arrendatario;

test.before(async () => { app = await startApp('/api/usuarios', router); });
test.after(() => app.close());

test.beforeEach((t) => {
  fakeDb.usuarios = [];
  fakeDb.calls = [];
  fakeDb.error = null;
  admin = fakeDb.addUsuario({
    empresa_id: 2, nombre: 'Jefe', documento: '100', correo: 'jefe@kuvu.co', idRol: 1, password_hash: HASH_ADMIN,
  });
  arrendatario = fakeDb.addUsuario({
    empresa_id: 2, nombre: 'Ana', documento: '1128074279', correo: 'ana@kuvu.co', idRol: 2, password_hash: HASH_USER,
  });
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'error', () => {});
});

const NUEVO = {
  empresa_id: 2, nombre: 'Luis', documento: '555666', telefono: '300', correo: 'luis@kuvu.co', idRol: 2,
  passwordTemporal: 'Ventana$Roja77',
};
const crear = (body) => post(app.baseUrl, body);
const restablecer = (id, body) => post(`${app.baseUrl}/${id}/restablecer-password`, body);

// ── Reads never expose the hash ──────────────────────────────

test('GET list and GET by id return public columns only', async () => {
  const list = await (await fetch(`${app.baseUrl}?empresa_id=2`)).json();
  const one = await (await fetch(`${app.baseUrl}/${arrendatario.idUsuario}`)).json();

  assert.strictEqual(list.length, 2);
  for (const u of [...list, one]) {
    assert.deepStrictEqual(Object.keys(u).sort(), [
      'correo', 'debe_cambiar_password', 'documento', 'empresa_id', 'idRol', 'idUsuario', 'nombre', 'nombreRol', 'telefono',
    ]);
  }
  assert.ok(fakeDb.calls.every((c) => !/u\.\*/.test(c.sql)));
});

// ── Create ───────────────────────────────────────────────────

test('create answers 400 without a temporary password', async () => {
  const res = await crear({ ...NUEVO, passwordTemporal: '', admin: ADMIN });

  assert.strictEqual(res.status, 400);
});

test('create answers 401 without valid administrator credentials', async () => {
  const none = await crear({ ...NUEVO });
  const wrong = await crear({ ...NUEVO, admin: { ...ADMIN, password: 'Mala#Clave1' } });

  for (const r of [none, wrong]) {
    assert.strictEqual(r.status, 401);
    assert.deepStrictEqual(r.body, { error: MENSAJE_ACCESO });
  }
  assert.strictEqual(admin.intentos_fallidos, 1, 'a wrong admin password counts toward the admin lock');
  assert.strictEqual(fakeDb.usuarios.length, 2);
});

test('create answers 403 for a tenant or an administrator of another company', async () => {
  const tenant = await crear({
    ...NUEVO, admin: { correo: 'ana@kuvu.co', documento: '1128074279', password: 'Tejado#Azul42', empresa_id: 2 },
  });
  const other = await crear({ ...NUEVO, empresa_id: 1, admin: ADMIN });

  assert.strictEqual(tenant.status, 403);
  assert.strictEqual(other.status, 403);
  assert.strictEqual(fakeDb.usuarios.length, 2);
});

test('create answers 403 while the administrator still has a temporary password', async () => {
  admin.debe_cambiar_password = 1;

  const res = await crear({ ...NUEVO, admin: ADMIN });

  assert.strictEqual(res.status, 403);
});

test('create answers 400 when the temporary password breaks the policy', async () => {
  const res = await crear({ ...NUEVO, passwordTemporal: 'Luis#555666', admin: ADMIN });

  assert.strictEqual(res.status, 400);
  assert.ok(res.body.reglas.some((r) => r.codigo === 'CONTIENE_DOCUMENTO'));
});

test('create stores a hash with the change required', async () => {
  const res = await crear({ ...NUEVO, admin: ADMIN });

  assert.strictEqual(res.status, 201);
  assert.deepStrictEqual(Object.keys(res.body).sort(), ['idUsuario', 'ok']);
  const created = fakeDb.find(res.body.idUsuario);
  assert.strictEqual(created.debe_cambiar_password, 1);
  assert.notStrictEqual(created.password_hash, 'Ventana$Roja77');
  assert.strictEqual(await verifyPassword('Ventana$Roja77', created.password_hash), true);
});

// ── Reset ────────────────────────────────────────────────────

test('reset answers 404 for an unknown user', async () => {
  const res = await restablecer(99, { passwordTemporal: 'Ventana$Roja77', admin: ADMIN });

  assert.strictEqual(res.status, 404);
});

test('reset answers 401 / 403 without a valid administrator of the same company', async () => {
  const wrong = await restablecer(arrendatario.idUsuario, {
    passwordTemporal: 'Ventana$Roja77', admin: { ...ADMIN, documento: '999' },
  });
  const foreign = fakeDb.addUsuario({
    empresa_id: 1, nombre: 'Otro', documento: '7', correo: 'otro@kuvu.co', idRol: 2, password_hash: HASH_USER,
  });
  const otherCompany = await restablecer(foreign.idUsuario, { passwordTemporal: 'Ventana$Roja77', admin: ADMIN });

  assert.strictEqual(wrong.status, 401);
  assert.strictEqual(otherCompany.status, 403);
  assert.strictEqual(foreign.password_hash, HASH_USER);
});

test('an administrator cannot reset their own password', async () => {
  const res = await restablecer(admin.idUsuario, { passwordTemporal: 'Ventana$Roja77', admin: ADMIN });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(admin.password_hash, HASH_ADMIN);
});

test('reset answers 400 when the temporary password breaks the policy', async () => {
  const res = await restablecer(arrendatario.idUsuario, { passwordTemporal: 'corta', admin: ADMIN });

  assert.strictEqual(res.status, 400);
  assert.ok(res.body.reglas.length > 0);
});

test('reset sets the temporary password, requires a change and unlocks the account', async () => {
  arrendatario.intentos_fallidos = 3;
  arrendatario.bloqueado_hasta = new Date(Date.now() + 60_000);

  const res = await restablecer(arrendatario.idUsuario, { passwordTemporal: 'Ventana$Roja77', admin: ADMIN });

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { ok: true });
  assert.strictEqual(arrendatario.debe_cambiar_password, 1);
  assert.strictEqual(arrendatario.intentos_fallidos, 0);
  assert.strictEqual(arrendatario.bloqueado_hasta, null);
  assert.strictEqual(await verifyPassword('Ventana$Roja77', arrendatario.password_hash), true);
});

// ── Edit ignores password fields ─────────────────────────────

test('PUT ignores password and lock fields in the body', async () => {
  const res = await fetch(`${app.baseUrl}/${arrendatario.idUsuario}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Ana M', documento: '1128074279', correo: 'ana@kuvu.co', idRol: 2,
      password_hash: 'x', passwordTemporal: 'Ventana$Roja77', debe_cambiar_password: 0,
      intentos_fallidos: 0, bloqueado_hasta: null,
    }),
  });

  assert.strictEqual(res.status, 200);
  const call = fakeDb.calls.at(-1);
  assert.doesNotMatch(call.sql, /password|intentos|bloqueado/i);
  assert.strictEqual(call.params.length, 6);
  assert.strictEqual(arrendatario.password_hash, HASH_USER);
  assert.strictEqual(arrendatario.nombre, 'Ana M');
});
