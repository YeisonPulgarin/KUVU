// ─────────────────────────────────────────────────────────────
//  routes/mantenimiento.js
//  GET    /api/mantenimiento?empresa_id=1
//  GET    /api/mantenimiento/:id
//  POST   /api/mantenimiento
//  PUT    /api/mantenimiento/:id  (cambiar estado)
//  DELETE /api/mantenimiento/:id
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Listar mantenimientos con detalles
router.get('/', async (req, res) => {
  const { empresa_id } = req.query;
  if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });

  try {
    const [rows] = await db.execute(
      `SELECT 
         m.*,
         l.direccion    AS direccionLocal,
         ua.nombre      AS nombreArrendatario,
         adm.nombre     AS nombreAdministrador
       FROM mantenimiento m
       LEFT JOIN local    l   ON m.idLocal         = l.idLocal
       LEFT JOIN usuarios ua  ON m.idArrendatario  = ua.idUsuario
       LEFT JOIN usuarios adm ON m.idAdministrador = adm.idUsuario
       WHERE m.empresa_id = ?
       ORDER BY 
         FIELD(m.prioridad, 'urgente', 'normal', 'baja'),
         FIELD(m.estado, 'pendiente', 'en_proceso', 'completado', 'cancelado'),
         m.fecha_creacion DESC`,
      [empresa_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error mantenimiento:', err.message);
    res.status(500).json({ error: 'Error al obtener mantenimientos' });
  }
});

// Un mantenimiento por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM mantenimiento WHERE idMantenimiento = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mantenimiento' });
  }
});

// Crear mantenimiento
router.post('/', async (req, res) => {
  const { empresa_id, idLocal, idArrendatario, tipoMantenimiento,
          descripcion, prioridad, idAdministrador } = req.body;

  if (!empresa_id || !idLocal || !idArrendatario || !tipoMantenimiento || !descripcion || !idAdministrador) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const prioridadesValidas = ['baja', 'normal', 'urgente'];
  const prioridadFinal = prioridadesValidas.includes(prioridad) ? prioridad : 'normal';

  try {
    const [result] = await db.execute(
      `INSERT INTO mantenimiento 
         (empresa_id, idLocal, idArrendatario, tipoMantenimiento, descripcion, prioridad, estado, idAdministrador)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
      [empresa_id, idLocal, idArrendatario, tipoMantenimiento, descripcion, prioridadFinal, idAdministrador]
    );
    res.status(201).json({ ok: true, idMantenimiento: result.insertId });
  } catch (err) {
    console.error('Error crear mantenimiento:', err.message);
    res.status(500).json({ error: 'Error al crear mantenimiento' });
  }
});

// Actualizar estado (y otros campos)
router.put('/:id', async (req, res) => {
  const { estado, prioridad, tipoMantenimiento, descripcion } = req.body;

  const estadosValidos    = ['pendiente', 'en_proceso', 'completado', 'cancelado'];
  const prioridadesValidas = ['baja', 'normal', 'urgente'];

  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    await db.execute(
      `UPDATE mantenimiento 
       SET estado             = COALESCE(?, estado),
           prioridad          = COALESCE(?, prioridad),
           tipoMantenimiento  = COALESCE(?, tipoMantenimiento),
           descripcion        = COALESCE(?, descripcion)
       WHERE idMantenimiento  = ?`,
      [
        estado     && estadosValidos.includes(estado)         ? estado     : null,
        prioridad  && prioridadesValidas.includes(prioridad)  ? prioridad  : null,
        tipoMantenimiento || null,
        descripcion       || null,
        req.params.id
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar mantenimiento' });
  }
});

// Eliminar mantenimiento
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM mantenimiento WHERE idMantenimiento = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar mantenimiento' });
  }
});

module.exports = router;
