// scripts/bootstrap-passwords.js — gives every user without a password a temporary one
// equal to their document (hashed), with a change required on first sign-in.
//
// Idempotent: it only touches rows whose password_hash is NULL, so a second run updates 0.
// Prints only counts, never documents or passwords.
//
// Usage (from backend/, after db/init/03-auth-columnas.sql):  npm run passwords:bootstrap
const { hashPassword } = require('../auth/password');

async function bootstrapPasswords(db) {
  const [rows] = await db.execute(
    'SELECT idUsuario, documento FROM usuarios WHERE password_hash IS NULL'
  );
  let actualizados = 0;
  for (const row of rows) {
    const [result] = await db.execute(
      `UPDATE usuarios SET password_hash = ?, debe_cambiar_password = 1
       WHERE idUsuario = ? AND password_hash IS NULL`,
      [await hashPassword(String(row.documento).trim()), row.idUsuario]
    );
    actualizados += result.affectedRows;
  }
  return { pendientes: rows.length, actualizados };
}

module.exports = { bootstrapPasswords };

if (require.main === module) {
  const db = require('../db');
  bootstrapPasswords(db)
    .then((r) => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(), level: 'INFO', service: 'kuvu-backend',
        msg: 'passwords.bootstrap', actualizados: r.actualizados,
      }));
    })
    .catch((err) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(), level: 'ERROR', service: 'kuvu-backend',
        msg: 'passwords.bootstrap_error', code: err.code || 'UNKNOWN',
      }));
      process.exitCode = 1;
    })
    .finally(() => db.end());
}
