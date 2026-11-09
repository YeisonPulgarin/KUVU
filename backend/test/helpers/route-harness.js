// Mounts a router on an ephemeral Express app with the real `db` module replaced by a
// fake, so route tests need no database.
const path = require('node:path');
const express = require('express');

function installFakeDb(fakeDb) {
  const dbPath = require.resolve(path.join(__dirname, '..', '..', 'db'));
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakeDb };
}

async function startApp(mountPath, router) {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}${mountPath}`;
  return { server, baseUrl, close: () => new Promise((r) => server.close(r)) };
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

module.exports = { installFakeDb, startApp, post };
