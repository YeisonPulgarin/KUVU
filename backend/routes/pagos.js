// ─────────────────────────────────────────────────────────────
//  routes/pagos.js
//  GET    /api/pagos?empresa_id=1
//  GET    /api/pagos/:id
//  POST   /api/pagos
//  DELETE /api/pagos/:id
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Listar pagos con detalles
router.get('/', async (req, res) => {
  const { empresa_id } = req.query;
  if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });

  try {
    const [rows] = await db.execute(
      `SELECT 
         p.*,
         ua.nombre  AS nombreArrendatario,
         l.direccion AS direccionLocal,
         adm.nombre  AS nombreAdministrador
       FROM pago_variados p
       LEFT JOIN usuarios ua  ON p.idArrendatario  = ua.idUsuario
       LEFT JOIN local    l   ON p.idLocal          = l.idLocal
       LEFT JOIN usuarios adm ON p.idAdministrador  = adm.idUsuario
       WHERE p.empresa_id = ?
       ORDER BY p.fechaPago DESC, p.idPagoVariado DESC`,
      [empresa_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error pagos:', err.message);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// Un pago por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM pago_variados WHERE idPagoVariado = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pago' });
  }
});

// Registrar pago
router.post('/', async (req, res) => {
  const { empresa_id, fechaPago, monto, tipo, descripcion, metodoPago,
          idArrendatario, idAdministrador, idLocal, idContrato } = req.body;

  if (!empresa_id || !fechaPago || !monto || !tipo || !idArrendatario || !idAdministrador || !idLocal) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Validar tipo según el ENUM de la BD
  const tiposValidos = ['Arriendo', 'Multa', 'Otro'];
  const tipoFinal = tiposValidos.includes(tipo) ? tipo : 'Otro';

  try {
    const [result] = await db.execute(
      `INSERT INTO pago_variados 
         (empresa_id, fechaPago, monto, tipo, descripcion, metodoPago, idArrendatario, idAdministrador, idLocal, idContrato)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [empresa_id, fechaPago, monto, tipoFinal, descripcion || null,
       metodoPago || 'Efectivo', idArrendatario, idAdministrador, idLocal, idContrato || null]
    );
    res.status(201).json({ ok: true, idPagoVariado: result.insertId });
  } catch (err) {
    console.error('Error crear pago:', err.message);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

// Eliminar pago
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM pago_variados WHERE idPagoVariado = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
});

module.exports = router;
