// auth/admin.js — authorizes an administrator action by re-checking the administrator's
// full credentials. The API has no session, so this is what keeps "create user" and
// "reset password" from being open to anyone. Failures count toward the administrator's
// own lock, so these endpoints are no unlimited brute-force oracle.
const { verificarCredenciales, MENSAJE_ACCESO } = require('./credentials');

const ID_ROL_ADMIN = 1;

function faltanCredenciales(admin) {
  return !admin || !admin.correo || !admin.documento || !admin.password || !admin.empresa_id;
}

/**
 * @returns {Promise<{ ok: true, admin: object } | { ok: false, status: number, error: string, motivo: string }>}
 */
async function autorizarAdmin(db, admin, empresaIdDestino) {
  if (faltanCredenciales(admin)) {
    return { ok: false, status: 401, error: MENSAJE_ACCESO, motivo: 'faltan_datos' };
  }

  const r = await verificarCredenciales(db, admin);

  if (r.estado === 'rechazado') {
    return { ok: false, status: 401, error: MENSAJE_ACCESO, motivo: r.motivo };
  }
  if (r.estado === 'cambio_requerido') {
    return {
      ok: false,
      status: 403,
      error: 'Cambia tu contraseña temporal antes de administrar usuarios.',
      motivo: 'cambio_requerido',
    };
  }
  if (Number(r.usuario.idRol) !== ID_ROL_ADMIN || Number(r.usuario.empresa_id) !== Number(empresaIdDestino)) {
    return { ok: false, status: 403, error: 'No tienes permiso para esta operación.', motivo: 'sin_permiso' };
  }
  return { ok: true, admin: r.usuario };
}

module.exports = { autorizarAdmin, ID_ROL_ADMIN };
