// auth/auth-log.js — structured JSON log lines for authentication events.
//
// Only allowlisted fields reach the output, so an e-mail, a document number or a password
// cannot leak into the logs even if a caller passes it by mistake.
const ALLOWED = ['empresa_id', 'idUsuario', 'idUsuarioDestino', 'motivo', 'actualizados'];

const SERVICE = 'kuvu-backend';

function logAuth(level, msg, fields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE,
    env: process.env.NODE_ENV || 'development',
    msg,
  };
  for (const key of ALLOWED) {
    if (fields[key] !== undefined && fields[key] !== null) entry[key] = fields[key];
  }
  const line = JSON.stringify(entry);
  if (level === 'INFO') console.log(line);
  else console.error(line);
}

module.exports = { logAuth, ALLOWED };
