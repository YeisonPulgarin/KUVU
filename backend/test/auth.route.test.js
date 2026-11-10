const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');

const { createFakeDb } = require('./helpers/fake-db');
const { installFakeDb, startApp, post } = require('./helpers/route-harness');

const fakeDb = createFakeDb();
installFakeDb(fakeDb);

const router = require('../routes/auth');
const { MENSAJE_ACCESO, MAX_INTENTOS } = require('../auth/credentials');
const { verifyPassword } = require('../auth/password');

const HASH = bcrypt.hashSync('Tejado#Azul42', 4);
const LOGIN = { correo: 'ana@kuvu.co', documento: '1128074279', password: 'Tejado#Azul42', empresa_id: 2 };

let app;
let logs;
let user;

test.before(async () => { app = await startApp('/api/auth', router); });
test.after(() => app.close());

test.beforeEach((t) => {
  fakeDb.usuarios = [];
  fakeDb.calls = [];
  fakeDb.error = null;
  user = fakeDb.addUsuario({
    empresa_id: 2, nombre: 'Ana', documento: '1128074279', correo: 'ana@kuvu.co', idRol: 2, password_hash: HASH,
  });
  logs = [];
  t.mock.method(console, 'log', (l) => logs.push(l));
  t.mock.method(console, 'error', (l) => logs.push(String(l)));
});

const login = (body) => post(`${app.baseUrl}/login`, body);
const cambiar = (body) => post(`${app.baseUrl}/cambiar-password`, body);

// ── Login ────────────────────────────────────────────────────

test('login answers 400 when any value is missing', async () => {
  for (const key of ['correo', 'documento', 'password', 'empresa_id']) {
    const res = await login({ ...LOGIN, [key]: '' });
    assert.strictEqual(res.status, 400, key);
  }
});

test('login answers 200 with the user and company, without the hash', async () => {
  const res = await login(LOGIN);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.ok, true);
  assert.strictEqual(res.body.requiereCambioPassword, false);
  assert.deepStrictEqual(Object.keys(res.body.usuario).sort(), [
    'correo', 'documento', 'empresa_id', 'idRol', 'idUsuario', 'nombre', 'nombreEmpresa', 'nombreRol',
  ]);
  assert.strictEqual(res.body.empresa.id, 2);
  assert.doesNotMatch(JSON.stringify(res.body), /password|\$2[aby]\$|intentos|bloqueado/);
});

test('login with a temporary password asks for a change and returns no user data', async () => {
  user.debe_cambiar_password = 1;

  const res = await login(LOGIN);

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { ok: true, requiereCambioPassword: true });
  assert.strictEqual(user.intentos_fallidos, 0);
});

test('every rejection answers 401 with the same body', async () => {
  const bodies = [];
  bodies.push(await login({ ...LOGIN, password: 'Otra#Clave99' }));
  bodies.push(await login({ ...LOGIN, documento: '000' }));
  bodies.push(await login({ ...LOGIN, correo: 'nadie@kuvu.co' }));
  bodies.push(await login({ ...LOGIN, empresa_id: 1 }));
  user.password_hash = null;
  bodies.push(await login(LOGIN));
  user.password_hash = HASH;
  user.bloqueado_hasta = new Date(Date.now() + 60_000);
  bodies.push(await login(LOGIN));

  for (const r of bodies) {
    assert.strictEqual(r.status, 401);
    assert.deepStrictEqual(r.body, { error: MENSAJE_ACCESO });
  }
});

test(`login locks the account after ${MAX_INTENTOS} failures`, async () => {
  for (let i = 0; i < MAX_INTENTOS; i++) await login({ ...LOGIN, password: 'Mala#Clave1' });

  const res = await login(LOGIN);

  assert.strictEqual(res.status, 401);
  assert.ok(user.bloqueado_hasta > new Date());
});

test('login never uses SELECT u.*', async () => {
  await login(LOGIN);

  assert.ok(fakeDb.calls.every((c) => !/u\.\*/.test(c.sql)));
});

test('login answers 500 without internal details when the database fails', async () => {
  fakeDb.error = new Error('ECONNREFUSED');

  const res = await login(LOGIN);

  assert.strictEqual(res.status, 500);
  assert.deepStrictEqual(res.body, { error: 'Error interno del servidor' });
});

test('login logs JSON events without e-mail, document or password', async () => {
  await login(LOGIN);
  await login({ ...LOGIN, password: 'Otra#Clave99' });

  const events = logs.map((l) => JSON.parse(l));
  assert.deepStrictEqual(events.map((e) => e.msg), ['auth.login_ok', 'auth.login_rechazado']);
  assert.strictEqual(events[1].motivo, 'credenciales');
  assert.strictEqual(events[1].level, 'WARN');
  for (const l of logs) assert.doesNotMatch(l, /ana@kuvu\.co|1128074279|Tejado#Azul42|Otra#Clave99/);
});

// ── Change password ──────────────────────────────────────────

test('change answers 400 when a value is missing', async () => {
  const res = await cambiar({ ...LOGIN });

  assert.strictEqual(res.status, 400);
});

test('change answers 401 with the generic body on wrong credentials and counts the failure', async () => {
  const res = await cambiar({ ...LOGIN, password: 'Mala#Clave1', passwordNueva: 'Ventana$Roja77' });

  assert.strictEqual(res.status, 401);
  assert.deepStrictEqual(res.body, { error: MENSAJE_ACCESO });
  assert.strictEqual(user.intentos_fallidos, 1);
});

test('change answers 400 with the broken rules and does not count a failure', async () => {
  const res = await cambiar({ ...LOGIN, passwordNueva: 'Password1!' });

  assert.strictEqual(res.status, 400);
  assert.ok(res.body.reglas.some((r) => r.codigo === 'COMUN'));
  assert.strictEqual(user.intentos_fallidos, 0);
  assert.strictEqual(user.password_hash, HASH);
});

test('change rejects reusing the current password or containing the document', async () => {
  const same = await cambiar({ ...LOGIN, passwordNueva: 'Tejado#Azul42' });
  const doc = await cambiar({ ...LOGIN, passwordNueva: 'Clave#1128074279' });

  assert.ok(same.body.reglas.some((r) => r.codigo === 'IGUAL_ACTUAL'));
  assert.ok(doc.body.reglas.some((r) => r.codigo === 'CONTIENE_DOCUMENTO'));
});

test('change stores the new hash, clears the required change and answers like a login', async () => {
  user.debe_cambiar_password = 1;
  user.intentos_fallidos = 2;

  const res = await cambiar({ ...LOGIN, passwordNueva: 'Ventana$Roja77' });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.ok, true);
  assert.strictEqual(res.body.usuario.idUsuario, user.idUsuario);
  assert.doesNotMatch(JSON.stringify(res.body), /\$2[aby]\$/);
  assert.strictEqual(user.debe_cambiar_password, 0);
  assert.strictEqual(user.intentos_fallidos, 0);
  assert.strictEqual(await verifyPassword('Ventana$Roja77', user.password_hash), true);

  const again = await login({ ...LOGIN, password: 'Ventana$Roja77' });
  assert.strictEqual(again.body.requiereCambioPassword, false);
});
