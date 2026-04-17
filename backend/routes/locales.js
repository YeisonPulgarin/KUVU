// ─────────────────────────────────────────────────────────────
//  routes/locales.js
//  GET    /api/locales?empresa_id=1
//  GET    /api/locales/:id
//  POST   /api/locales
//  PUT    /api/locales/:id
//  DELETE /api/locales/:id
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Listar locales de una empresa (con nombre del administrador)
router.get('/', async (req, res) => {
  const { empresa_id } = req.query;
  if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });

  try {
    const [rows] = await db.execute(
      `SELECT l.*, u.nombre AS nombreAdministrador
       FROM local l
       LEFT JOIN usuarios u ON l.idAdministrador = u.idUsuario
       WHERE l.empresa_id = ?
       ORDER BY l.idLocal`,
      [empresa_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error locales:', err.message);
    res.status(500).json({ error: 'Error al obtener locales' });
  }
});

// Un local por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT l.*, u.nombre AS nombreAdministrador
       FROM local l
       LEFT JOIN usuarios u ON l.idAdministrador = u.idUsuario
       WHERE l.idLocal = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Local no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener local' });
  }
});

// Crear local
router.post('/', async (req, res) => {
  const { empresa_id, direccion, area, valorArriendo, idAdministrador } = req.body;
  if (!empresa_id || !direccion || !idAdministrador) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const [result] = await db.execute(
      `INSERT INTO local (empresa_id, direccion, area, valorArriendo, idAdministrador)
       VALUES (?, ?, ?, ?, ?)`,
      [empresa_id, direccion, area || null, valorArriendo || null, idAdministrador]
    );
    res.status(201).json({ ok: true, idLocal: result.insertId });
  } catch (err) {
    console.error('Error crear local:', err.message);
    res.status(500).json({ error: 'Error al crear local' });
  }
});

// Actualizar local
router.put('/:id', async (req, res) => {
  const { direccion, area, valorArriendo, idAdministrador } = req.body;
  try {
    await db.execute(
      `UPDATE local SET direccion=?, area=?, valorArriendo=?, idAdministrador=?
       WHERE idLocal=?`,
      [direccion, area || null, valorArriendo || null, idAdministrador, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar local' });
  }
});

// Eliminar local
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM local WHERE idLocal = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'No se puede eliminar: tiene contratos asociados' });
  }
});

module.exports = router;
