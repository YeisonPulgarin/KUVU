// routes/usuarios.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { hashPassword } = require('../auth/password');
const { validarPassword } = require('../auth/password-policy');
const { autorizarAdmin } = require('../auth/admin');
const { logAuth } = require('../auth/auth-log');

// Public columns only: the hash and the lock state never leave the server.
const COLUMNAS = `u.idUsuario, u.empresa_id, u.nombre, u.documento, u.telefono, u.correo,
                  u.idRol, u.debe_cambiar_password, r.nombreRol`;

// GET /api/usuarios?empresa_id=1
router.get('/', async (req, res) => {
  const { empresa_id } = req.query;
  if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });
  try {
    const [rows] = await db.execute(
      `SELECT ${COLUMNAS}
       FROM usuarios u
       JOIN rol r ON u.idRol = r.idRol
       WHERE u.empresa_id = ?
       ORDER BY u.idRol, u.nombre`,
      [empresa_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error usuarios:', err.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ${COLUMNAS}
       FROM usuarios u
       JOIN rol r ON u.idRol = r.idRol
       WHERE u.idUsuario = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// POST /api/usuarios
//   body: { empresa_id, nombre, documento, telefono, correo, idRol, passwordTemporal,
//           admin: { correo, documento, password, empresa_id } }
router.post('/', async (req, res) => {
  const { empresa_id, nombre, documento, telefono, correo, idRol, passwordTemporal, admin } = req.body || {};
  if (!empresa_id || !nombre || !documento || !idRol || !passwordTemporal) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const auth = await autorizarAdmin(db, admin, empresa_id);
    if (!auth.ok) {
      logAuth('WARN', 'usuarios.creacion_rechazada', { empresa_id: Number(empresa_id), motivo: auth.motivo });
      return res.status(auth.status).json({ error: auth.error });
    }

    const reglas = validarPassword(passwordTemporal, { correo, documento });
    if (reglas.length > 0) {
      return res.status(400).json({ error: 'La contraseña no cumple la política', reglas });
    }

    const [result] = await db.execute(
      `INSERT INTO usuarios (empresa_id, nombre, documento, telefono, correo, idRol, password_hash, debe_cambiar_password)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [empresa_id, nombre, documento, telefono || null, correo || null, idRol, await hashPassword(passwordTemporal)]
    );
    logAuth('INFO', 'usuarios.creado', {
      empresa_id: Number(empresa_id), idUsuario: auth.admin.idUsuario, idUsuarioDestino: result.insertId,
    });
    res.status(201).json({ ok: true, idUsuario: result.insertId });
  } catch (err) {
    console.error('Error crear usuario:', err.message);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// POST /api/usuarios/:id/restablecer-password
//   body: { passwordTemporal, admin: { correo, documento, password, empresa_id } }
router.post('/:id/restablecer-password', async (req, res) => {
  const { passwordTemporal, admin } = req.body || {};
  if (!passwordTemporal) return res.status(400).json({ error: 'La contraseña temporal es requerida' });
  try {
    const [rows] = await db.execute(
      'SELECT idUsuario, empresa_id, correo, documento FROM usuarios WHERE idUsuario = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    const destino = rows[0];

    const auth = await autorizarAdmin(db, admin, destino.empresa_id);
    if (!auth.ok) {
      logAuth('WARN', 'auth.restablecimiento_rechazado', {
        empresa_id: destino.empresa_id, idUsuarioDestino: destino.idUsuario, motivo: auth.motivo,
      });
      return res.status(auth.status).json({ error: auth.error });
    }
    if (auth.admin.idUsuario === destino.idUsuario) {
      return res.status(400).json({ error: 'Usa "Cambiar contraseña" para tu propia cuenta.' });
    }

    const reglas = validarPassword(passwordTemporal, { correo: destino.correo, documento: destino.documento });
    if (reglas.length > 0) {
      return res.status(400).json({ error: 'La contraseña no cumple la política', reglas });
    }

    await db.execute(
      `UPDATE usuarios SET password_hash = ?, debe_cambiar_password = 1,
              intentos_fallidos = 0, bloqueado_hasta = NULL
       WHERE idUsuario = ?`,
      [await hashPassword(passwordTemporal), destino.idUsuario]
    );
    logAuth('INFO', 'auth.password_restablecida', {
      empresa_id: destino.empresa_id, idUsuario: auth.admin.idUsuario, idUsuarioDestino: destino.idUsuario,
    });
    res.json({ ok: true });
  } catch (err) {
    logAuth('ERROR', 'auth.error', { motivo: 'restablecer_password' });
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
});

// PUT /api/usuarios/:id — never reads or writes the password or the lock state.
router.put('/:id', async (req, res) => {
  const { nombre, documento, telefono, correo, idRol } = req.body;
  try {
    await db.execute(
      `UPDATE usuarios SET nombre=?, documento=?, telefono=?, correo=?, idRol=?
       WHERE idUsuario=?`,
      [nombre, documento, telefono || null, correo || null, idRol, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM usuarios WHERE idUsuario = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
