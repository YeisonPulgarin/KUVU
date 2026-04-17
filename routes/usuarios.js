// routes/usuarios.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/usuarios?empresa_id=1
router.get('/', async (req, res) => {
  const { empresa_id } = req.query;
  if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });
  try {
    const [rows] = await db.execute(
      `SELECT u.*, r.nombreRol
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
      `SELECT u.*, r.nombreRol
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
router.post('/', async (req, res) => {
  const { empresa_id, nombre, documento, telefono, correo, idRol } = req.body;
  if (!empresa_id || !nombre || !documento || !idRol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const [result] = await db.execute(
      `INSERT INTO usuarios (empresa_id, nombre, documento, telefono, correo, idRol)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [empresa_id, nombre, documento, telefono || null, correo || null, idRol]
    );
    res.status(201).json({ ok: true, idUsuario: result.insertId });
  } catch (err) {
    console.error('Error crear usuario:', err.message);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT /api/usuarios/:id
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
