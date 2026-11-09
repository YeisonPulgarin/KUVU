// routes/auth.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { hashPassword } = require('../auth/password');
const { validarPassword } = require('../auth/password-policy');
const { verificarCredenciales, respuestaLogin, MENSAJE_ACCESO } = require('../auth/credentials');
const { logAuth } = require('../auth/auth-log');

function credencialesDe(body) {
  const { correo, documento, password, empresa_id } = body || {};
  return { correo, documento, password, empresa_id };
}

function faltan(...values) {
  return values.some((v) => v === undefined || v === null || String(v).trim() === '');
}

// POST /api/auth/login  —  body: { correo, documento, password, empresa_id }
router.post('/login', async (req, res) => {
  const creds = credencialesDe(req.body);

  if (faltan(creds.correo, creds.documento, creds.password, creds.empresa_id)) {
    logAuth('WARN', 'auth.login_rechazado', { motivo: 'faltan_datos' });
    return res.status(400).json({ error: 'Correo, documento, contraseña y empresa son requeridos' });
  }

  try {
    const r = await verificarCredenciales(db, creds);

    if (r.estado === 'rechazado') {
      logAuth('WARN', 'auth.login_rechazado', {
        empresa_id: Number(creds.empresa_id), idUsuario: r.idUsuario, motivo: r.motivo,
      });
      return res.status(401).json({ error: MENSAJE_ACCESO });
    }

    if (r.estado === 'cambio_requerido') {
      logAuth('INFO', 'auth.cambio_requerido', { empresa_id: r.usuario.empresa_id, idUsuario: r.usuario.idUsuario });
      return res.json({ ok: true, requiereCambioPassword: true });
    }

    logAuth('INFO', 'auth.login_ok', { empresa_id: r.usuario.empresa_id, idUsuario: r.usuario.idUsuario });
    return res.json(respuestaLogin(r.usuario));
  } catch (err) {
    logAuth('ERROR', 'auth.error', { motivo: 'login' });
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/cambiar-password
//   body: { correo, documento, password (current), passwordNueva, empresa_id }
router.post('/cambiar-password', async (req, res) => {
  const creds = credencialesDe(req.body);
  const { passwordNueva } = req.body || {};

  if (faltan(creds.correo, creds.documento, creds.password, creds.empresa_id, passwordNueva)) {
    return res.status(400).json({
      error: 'Correo, documento, contraseña actual, contraseña nueva y empresa son requeridos',
    });
  }

  try {
    const r = await verificarCredenciales(db, creds);

    if (r.estado === 'rechazado') {
      logAuth('WARN', 'auth.login_rechazado', {
        empresa_id: Number(creds.empresa_id), idUsuario: r.idUsuario, motivo: r.motivo,
      });
      return res.status(401).json({ error: MENSAJE_ACCESO });
    }

    const u = r.usuario;
    const reglas = validarPassword(passwordNueva, {
      correo: u.correo, documento: u.documento, actual: creds.password,
    });
    if (reglas.length > 0) {
      return res.status(400).json({ error: 'La contraseña no cumple la política', reglas });
    }

    await db.execute(
      `UPDATE usuarios SET password_hash = ?, debe_cambiar_password = 0,
              intentos_fallidos = 0, bloqueado_hasta = NULL
       WHERE idUsuario = ?`,
      [await hashPassword(passwordNueva), u.idUsuario]
    );

    logAuth('INFO', 'auth.password_cambiada', { empresa_id: u.empresa_id, idUsuario: u.idUsuario });
    return res.json(respuestaLogin(u));
  } catch (err) {
    logAuth('ERROR', 'auth.error', { motivo: 'cambiar_password' });
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
