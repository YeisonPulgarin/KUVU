// ─────────────────────────────────────────────────────────────
//  routes/contratos.js
//  GET    /api/contratos?empresa_id=1
//  GET    /api/contratos/:id
//  POST   /api/contratos
//  PUT    /api/contratos/:id
//  DELETE /api/contratos/:id
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Listar contratos con info de local y arrendatario
router.get('/', async (req, res) => {
  const { empresa_id } = req.query;
  if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });

  try {
    const [rows] = await db.execute(
      `SELECT 
         c.*,
         l.direccion        AS direccionLocal,
         l.valorArriendo,
         ua.nombre          AS nombreArrendatario,
         ua.correo          AS correoArrendatario,
         adm.nombre         AS nombreAdministrador
       FROM contratoarrendamiento c
       LEFT JOIN local    l   ON c.idLocal         = l.idLocal
       LEFT JOIN usuarios ua  ON c.idArrendatario  = ua.idUsuario
       LEFT JOIN usuarios adm ON c.idAdministrador = adm.idUsuario
       WHERE c.empresa_id = ?
       ORDER BY c.idContrato DESC`,
      [empresa_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error contratos:', err.message);
    res.status(500).json({ error: 'Error al obtener contratos' });
  }
});

// Un contrato por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*, l.direccion AS direccionLocal, ua.nombre AS nombreArrendatario
       FROM contratoarrendamiento c
       LEFT JOIN local    l  ON c.idLocal        = l.idLocal
       LEFT JOIN usuarios ua ON c.idArrendatario = ua.idUsuario
       WHERE c.idContrato = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener contrato' });
  }
});

// Crear contrato
router.post('/', async (req, res) => {
  const { empresa_id, fechaInicio, fechaFin, condiciones, idLocal, idArrendatario, idAdministrador } = req.body;
  if (!empresa_id || !fechaInicio || !fechaFin || !idLocal || !idArrendatario || !idAdministrador) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const [result] = await db.execute(
      `INSERT INTO contratoarrendamiento 
         (empresa_id, fechaInicio, fechaFin, condiciones, idLocal, idArrendatario, idAdministrador)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [empresa_id, fechaInicio, fechaFin, condiciones || '', idLocal, idArrendatario, idAdministrador]
    );
    res.status(201).json({ ok: true, idContrato: result.insertId });
  } catch (err) {
    console.error('Error crear contrato:', err.message);
    res.status(500).json({ error: 'Error al crear contrato' });
  }
});

// Actualizar contrato
router.put('/:id', async (req, res) => {
  const { fechaInicio, fechaFin, condiciones, idLocal, idArrendatario, idAdministrador } = req.body;
  try {
    await db.execute(
      `UPDATE contratoarrendamiento 
       SET fechaInicio=?, fechaFin=?, condiciones=?, idLocal=?, idArrendatario=?, idAdministrador=?
       WHERE idContrato=?`,
      [fechaInicio, fechaFin, condiciones || '', idLocal, idArrendatario, idAdministrador, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar contrato' });
  }
});

// Eliminar contrato
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM contratoarrendamiento WHERE idContrato = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar contrato' });
  }
});

module.exports = router;
