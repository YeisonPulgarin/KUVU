// routes/auth.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// POST /api/auth/login  —  body: { correo, documento, empresa_id }
router.post('/login', async (req, res) => {
  const { correo, documento, empresa_id } = req.body;

  if (!correo || !documento || !empresa_id) {
    return res.status(400).json({ error: 'Correo, documento y empresa_id son requeridos' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT u.*, r.nombreRol,
              e.nombre AS nombreEmpresa,
              e.color_primario, e.color_secundario, e.color_texto, e.logo_url, e.slogan
       FROM usuarios u
       JOIN rol      r ON r.idRol     = u.idRol        -- JOIN simple, sin empresa_id
       JOIN empresas e ON e.id        = u.empresa_id
       WHERE u.correo      = ?
         AND u.documento   = ?
         AND u.empresa_id  = ?
         AND e.activo      = 1`,
      [correo.trim(), documento.trim(), Number(empresa_id)]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Correo o documento incorrecto para esta empresa' });
    }

    const u = rows[0];

    return res.json({
      ok: true,
      usuario: {
        idUsuario:    u.idUsuario,
        nombre:       u.nombre,
        correo:       u.correo,
        documento:    u.documento,
        idRol:        u.idRol,
        nombreRol:    u.nombreRol,   // 'Administrador' | 'Arrendatario'
        empresa_id:   u.empresa_id,
        nombreEmpresa: u.nombreEmpresa,
      },
      empresa: {
        id:               u.empresa_id,
        nombre:           u.nombreEmpresa,
        color_primario:   u.color_primario,
        color_secundario: u.color_secundario,
        color_texto:      u.color_texto,
        logo_url:         u.logo_url,
        slogan:           u.slogan,
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
