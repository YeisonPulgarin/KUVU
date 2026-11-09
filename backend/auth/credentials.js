// auth/credentials.js — checks full credentials (e-mail + document + password + company)
// and keeps the per-account failure counter and temporary lock.
// Called through the module object so tests can observe every hash verification.
const password = require('./password');
const { logAuth } = require('./auth-log');

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

// One message for every rejection: it never says which value failed or whether the
// account exists or is locked.
const MENSAJE_ACCESO =
  'Los datos de acceso no son válidos o la cuenta está bloqueada temporalmente. ' +
  'Revisa e intenta de nuevo en unos minutos.';

// Columns the login answers with, plus the internal state. Never `SELECT u.*`.
const SQL_CUENTAS = `
  SELECT u.idUsuario, u.empresa_id, u.nombre, u.documento, u.telefono, u.correo, u.idRol,
         u.password_hash, u.debe_cambiar_password, u.intentos_fallidos, u.bloqueado_hasta,
         r.nombreRol,
         e.nombre AS nombreEmpresa,
         e.color_primario, e.color_secundario, e.color_texto, e.logo_url, e.slogan
  FROM usuarios u
  JOIN rol      r ON r.idRol = u.idRol
  JOIN empresas e ON e.id    = u.empresa_id
  WHERE u.correo     = ?
    AND u.empresa_id = ?
    AND e.activo     = 1`;

function estaBloqueada(fila, ahora) {
  if (!fila.bloqueado_hasta) return false;
  return new Date(fila.bloqueado_hasta).getTime() > ahora;
}

async function registrarFallo(db, filas, ahora) {
  for (const fila of filas) {
    const n = (Number(fila.intentos_fallidos) || 0) + 1;
    if (n >= MAX_INTENTOS) {
      await db.execute(
        'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = ? WHERE idUsuario = ?',
        [new Date(ahora + BLOQUEO_MS), fila.idUsuario]
      );
      logAuth('WARN', 'auth.cuenta_bloqueada', { empresa_id: fila.empresa_id, idUsuario: fila.idUsuario });
    } else {
      await db.execute(
        'UPDATE usuarios SET intentos_fallidos = ? WHERE idUsuario = ?',
        [n, fila.idUsuario]
      );
    }
  }
}

/**
 * @returns {Promise<
 *   { estado: 'ok' | 'cambio_requerido', usuario: object } |
 *   { estado: 'rechazado', motivo: 'credenciales' | 'bloqueada' | 'sin_hash', idUsuario?: number }
 * >}
 */
async function verificarCredenciales(db, { correo, documento, password: clave, empresa_id }) {
  const ahora = Date.now();
  const [filas] = await db.execute(SQL_CUENTAS, [String(correo).trim(), Number(empresa_id)]);

  if (filas.length === 0) {
    await password.verifyPassword(clave, password.DUMMY_HASH);
    return { estado: 'rechazado', motivo: 'credenciales' };
  }

  const bloqueada = filas.find((f) => estaBloqueada(f, ahora));
  if (bloqueada) {
    // Same bcrypt cost as every other path: a fast answer would reveal that the account
    // exists and is locked.
    await password.verifyPassword(clave, password.DUMMY_HASH);
    return { estado: 'rechazado', motivo: 'bloqueada', idUsuario: bloqueada.idUsuario };
  }

  const doc = String(documento).trim();
  const fila = filas.find((f) => String(f.documento).trim() === doc);

  if (!fila || !fila.password_hash) {
    await password.verifyPassword(clave, password.DUMMY_HASH);
    await registrarFallo(db, filas, ahora);
    return fila
      ? { estado: 'rechazado', motivo: 'sin_hash', idUsuario: fila.idUsuario }
      : { estado: 'rechazado', motivo: 'credenciales' };
  }

  if (!(await password.verifyPassword(clave, fila.password_hash))) {
    await registrarFallo(db, filas, ahora);
    return { estado: 'rechazado', motivo: 'credenciales', idUsuario: fila.idUsuario };
  }

  if (Number(fila.intentos_fallidos) > 0 || fila.bloqueado_hasta) {
    await db.execute(
      'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE idUsuario = ?',
      [fila.idUsuario]
    );
  }

  return {
    estado: Number(fila.debe_cambiar_password) === 1 ? 'cambio_requerido' : 'ok',
    usuario: fila,
  };
}

/** Public shape of a successful login: never the hash or the lock state. */
function respuestaLogin(fila) {
  return {
    ok: true,
    requiereCambioPassword: false,
    usuario: {
      idUsuario: fila.idUsuario,
      nombre: fila.nombre,
      correo: fila.correo,
      documento: fila.documento,
      idRol: fila.idRol,
      nombreRol: fila.nombreRol,
      empresa_id: fila.empresa_id,
      nombreEmpresa: fila.nombreEmpresa,
    },
    empresa: {
      id: fila.empresa_id,
      nombre: fila.nombreEmpresa,
      color_primario: fila.color_primario,
      color_secundario: fila.color_secundario,
      color_texto: fila.color_texto,
      logo_url: fila.logo_url,
      slogan: fila.slogan,
    },
  };
}

module.exports = {
  verificarCredenciales,
  respuestaLogin,
  MENSAJE_ACCESO,
  MAX_INTENTOS,
  BLOQUEO_MS,
};
