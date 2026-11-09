// auth/password-policy.js — password policy. The backend is the authority; the frontend
// mirrors the local rules (everything but the blocklist) for live feedback.
const COMMON = require('./common-passwords');

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;
// bcrypt ignores everything past 72 bytes: a longer password would be silently truncated.
const MAX_BYTES = 72;
const MIN_LOCAL_PART = 4;

const MENSAJES = {
  LONGITUD: `Debe tener entre ${MIN_LENGTH} y ${MAX_LENGTH} caracteres.`,
  BYTES: 'Es demasiado larga: usa menos caracteres especiales o acentuados.',
  MAYUSCULA: 'Debe incluir al menos una letra mayúscula.',
  MINUSCULA: 'Debe incluir al menos una letra minúscula.',
  NUMERO: 'Debe incluir al menos un número.',
  SIMBOLO: 'Debe incluir al menos un símbolo (por ejemplo ! # $ * .).',
  COMUN: 'Es una contraseña demasiado común. Elige otra.',
  CONTIENE_CORREO: 'No puede contener tu correo.',
  CONTIENE_DOCUMENTO: 'No puede contener tu número de documento.',
  IGUAL_ACTUAL: 'Debe ser distinta de tu contraseña actual.',
};

function regla(codigo) {
  return { codigo, mensaje: MENSAJES[codigo] };
}

/**
 * Validates a new password. Returns [] when valid, or the list of broken rules.
 * @param {string} password
 * @param {{ correo?: string, documento?: string, actual?: string }} contexto
 */
function validarPassword(password, { correo, documento, actual } = {}) {
  if (typeof password !== 'string') return [regla('LONGITUD')];

  const reglas = [];
  const length = [...password].length;
  const lower = password.toLowerCase();

  if (length < MIN_LENGTH || length > MAX_LENGTH) reglas.push(regla('LONGITUD'));
  if (Buffer.byteLength(password, 'utf8') > MAX_BYTES) reglas.push(regla('BYTES'));
  if (!/\p{Lu}/u.test(password)) reglas.push(regla('MAYUSCULA'));
  if (!/\p{Ll}/u.test(password)) reglas.push(regla('MINUSCULA'));
  if (!/\p{Nd}/u.test(password)) reglas.push(regla('NUMERO'));
  if (!/[^\p{L}\p{Nd}]/u.test(password)) reglas.push(regla('SIMBOLO'));
  if (COMMON.has(lower)) reglas.push(regla('COMUN'));

  const email = typeof correo === 'string' ? correo.trim().toLowerCase() : '';
  if (email) {
    const local = email.split('@')[0];
    if (lower.includes(email) || (local.length >= MIN_LOCAL_PART && lower.includes(local))) {
      reglas.push(regla('CONTIENE_CORREO'));
    }
  }

  const doc = typeof documento === 'string' ? documento.trim().toLowerCase() : '';
  if (doc && lower.includes(doc)) reglas.push(regla('CONTIENE_DOCUMENTO'));

  if (typeof actual === 'string' && actual.length > 0 && password === actual) {
    reglas.push(regla('IGUAL_ACTUAL'));
  }

  return reglas;
}

module.exports = { validarPassword, MENSAJES, MIN_LENGTH, MAX_LENGTH, MAX_BYTES };
