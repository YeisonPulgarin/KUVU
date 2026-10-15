const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const express = require('express');

// Replace the real pool before the route loads it, so no database is needed.
const fakeDb = {
  calls: [],
  result: null,
  error: null,
  async execute(sql, params) {
    this.calls.push({ sql, params });
    if (this.error) throw this.error;
    return [this.result, []];
  },
};

const dbPath = require.resolve(path.join(__dirname, '..', 'db'));
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakeDb };

const router = require('../routes/empresas');

const ROWS_BY_ID = [
  { id: 1, nombre: 'Amarilo' },
  { id: 2, nombre: 'Nido Rent' },
  { id: 3, nombre: 'Balcones de San Soucci' },
  { id: 4, nombre: 'Mi Inmueble' },
];

let server;
let baseUrl;

test.before(async () => {
  const app = express();
  app.use('/api/empresas', router);
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/empresas`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

test.beforeEach(() => {
  fakeDb.calls = [];
  fakeDb.result = null;
  fakeDb.error = null;
});

test('lists active companies ordered by id', async () => {
  fakeDb.result = ROWS_BY_ID;

  const res = await fetch(baseUrl);

  assert.strictEqual(res.status, 200);
  assert.match(fakeDb.calls[0].sql, /WHERE\s+activo\s*=\s*1\s+ORDER BY\s+id\b/i);
  assert.doesNotMatch(fakeDb.calls[0].sql, /ORDER BY\s+nombre/i);
});

test('returns the companies in the order the query yields them', async () => {
  fakeDb.result = ROWS_BY_ID;

  const body = await (await fetch(baseUrl)).json();

  assert.deepStrictEqual(body.map((e) => e.nombre), [
    'Amarilo',
    'Nido Rent',
    'Balcones de San Soucci',
    'Mi Inmueble',
  ]);
});

test('answers 500 without internal details when the database fails', async (t) => {
  fakeDb.error = new Error('ECONNREFUSED 127.0.0.1:3306');
  t.mock.method(console, 'error', () => {});

  const res = await fetch(baseUrl);
  const body = await res.json();

  assert.strictEqual(res.status, 500);
  assert.deepStrictEqual(body, { error: 'Error al obtener empresas' });
});

test('keeps GET /:id returning one company', async () => {
  fakeDb.result = [ROWS_BY_ID[1]];

  const res = await fetch(`${baseUrl}/2`);

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), ROWS_BY_ID[1]);
  assert.deepStrictEqual(fakeDb.calls[0].params, ['2']);
});

test('keeps GET /:id answering 404 for an unknown company', async () => {
  fakeDb.result = [];

  const res = await fetch(`${baseUrl}/99`);

  assert.strictEqual(res.status, 404);
});
