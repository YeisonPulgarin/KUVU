// auth/password.js — password hashing with bcrypt (bcryptjs, pure JS: no native build).
const bcrypt = require('bcryptjs');

const COST = 12;

// Hash of a random value nobody knows. Verifying against it when the account does not
// exist (or has no hash) keeps the response time from revealing which case happened.
const DUMMY_HASH = '$2b$12$jV8f3e49XC/vHejLF0VkpeBhnm.30558X0Db/SiDGoO3f9Zgkx7S.';

function hashPassword(password) {
  return bcrypt.hash(password, COST);
}

async function verifyPassword(password, hash) {
  if (typeof password !== 'string' || typeof hash !== 'string') return false;
  return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, verifyPassword, DUMMY_HASH, COST };
