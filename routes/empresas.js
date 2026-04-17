// ─────────────────────────────────────────────────────────────
//  routes/empresas.js
//  GET /api/empresas          → todas las empresas activas
//  GET /api/empresas/:id      → una empresa por id
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Todas las empresas activas
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM empresas WHERE activo = 1 ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error empresas:', err.message);
    res.status(500).json({ error: 'Error al obtener empresas' });
  }
});

// Una empresa por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM empresas WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener empresa' });
  }
});

module.exports = router;
