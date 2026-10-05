// ─────────────────────────────────────────────────────────────
//  server.js  —  Servidor Express para ArrendApp
//  Corre en: http://localhost:3000
// ─────────────────────────────────────────────────────────────
const express = require('express');
const cors    = require('cors');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors()); // Permite Angular
app.use(express.json());

// ── Rutas ────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/empresas',      require('./routes/empresas'));
app.use('/api/usuarios',      require('./routes/usuarios'));
app.use('/api/locales',       require('./routes/locales'));
app.use('/api/contratos',     require('./routes/contratos'));
app.use('/api/pagos',         require('./routes/pagos'));
app.use('/api/mantenimiento', require('./routes/mantenimiento'));

// ── Ruta de prueba ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    mensaje: '✅ ArrendApp API corriendo',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/login',
      'GET  /api/empresas',
      'GET  /api/usuarios?empresa_id=1',
      'GET  /api/locales?empresa_id=1',
      'GET  /api/contratos?empresa_id=1',
      'GET  /api/pagos?empresa_id=1',
      'GET  /api/mantenimiento?empresa_id=1',
    ]
  });
});

// ── Manejo de errores globales ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error servidor:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Iniciar servidor ──────────────────────────────────────────
// Verify the database before listening: a dead database discovered per-request
// looks like an application bug instead of a startup failure.
db.checkConnection()
  .then(() => {
    console.log('✅ Conectado a MySQL');
    app.listen(PORT, () => {
      console.log(`\n🚀 ArrendApp Backend corriendo en http://localhost:${PORT}`);
      console.log(`   Angular debe correr en http://localhost:4200`);
      console.log(`   Prueba en: http://localhost:${PORT}/\n`);
    });
  })
  .catch(err => {
    console.error(`❌ No se pudo conectar a MySQL en ${db.config.host}:${db.config.port}: ${err.message}`);
    console.error('   Verificá que la base de datos esté levantada: docker compose ps');
    process.exit(1);
  });
