const test = require('node:test');
const assert = require('node:assert');

const { logAuth } = require('../auth/auth-log');

function capture(t) {
  const lines = [];
  t.mock.method(console, 'log', (l) => lines.push({ stream: 'out', l }));
  t.mock.method(console, 'error', (l) => lines.push({ stream: 'err', l }));
  return lines;
}

test('writes one JSON line with the base fields', (t) => {
  const lines = capture(t);

  logAuth('INFO', 'auth.login_ok', { empresa_id: 2, idUsuario: 7 });

  assert.strictEqual(lines.length, 1);
  const entry = JSON.parse(lines[0].l);
  assert.strictEqual(entry.level, 'INFO');
  assert.strictEqual(entry.msg, 'auth.login_ok');
  assert.strictEqual(entry.service, 'kuvu-backend');
  assert.ok(entry.env);
  assert.ok(!Number.isNaN(Date.parse(entry.timestamp)));
  assert.strictEqual(entry.empresa_id, 2);
  assert.strictEqual(entry.idUsuario, 7);
});

test('INFO goes to stdout; WARN and ERROR to stderr', (t) => {
  const lines = capture(t);

  logAuth('INFO', 'a');
  logAuth('WARN', 'b');
  logAuth('ERROR', 'c');

  assert.deepStrictEqual(lines.map((x) => x.stream), ['out', 'err', 'err']);
});

test('drops every field outside the allowlist', (t) => {
  const lines = capture(t);

  logAuth('WARN', 'auth.login_rechazado', {
    motivo: 'credenciales',
    correo: 'secreto@kuvu.co',
    documento: '1128074279',
    password: 'Tejado#Azul42',
    password_hash: '$2b$12$abc',
  });

  const raw = lines[0].l;
  assert.doesNotMatch(raw, /secreto@kuvu\.co|1128074279|Tejado#Azul42|\$2b\$/);
  assert.strictEqual(JSON.parse(raw).motivo, 'credenciales');
});
