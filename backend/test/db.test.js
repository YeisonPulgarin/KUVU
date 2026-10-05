const test = require('node:test');
const assert = require('node:assert');

const { checkConnection } = require('../db');

test('resolves when the database is reachable', async () => {
  const fake = {
    getConnection: () => Promise.resolve({ release: () => {} }),
  };

  await checkConnection(fake);
});

test('releases the connection after a successful check', async () => {
  let released = false;
  const fake = {
    getConnection: () => Promise.resolve({ release: () => { released = true; } }),
  };

  await checkConnection(fake);

  assert.strictEqual(released, true);
});

test('rejects when the connection fails', async () => {
  const fake = {
    getConnection: () => Promise.reject(new Error('Access denied')),
  };

  await assert.rejects(checkConnection(fake), /Access denied/);
});

test('rejects when the driver is down', async () => {
  const fake = {
    getConnection: () => Promise.reject(new Error('ECONNREFUSED')),
  };

  await assert.rejects(checkConnection(fake), /ECONNREFUSED/);
});

test('does not release the connection when acquiring it fails', async () => {
  let released = false;
  const fake = {
    getConnection: () => Promise.reject(new Error('ECONNREFUSED')),
    release: () => { released = true; },
  };

  await assert.rejects(checkConnection(fake));

  assert.strictEqual(released, false);
});
