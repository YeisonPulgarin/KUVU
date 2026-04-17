// ─────────────────────────────────────────────────────────────
//  db.js  —  Conexión a MariaDB/MySQL de XAMPP
//  Cambia solo DB_PASS si tu MySQL tiene contraseña
// ─────────────────────────────────────────────────────────────
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     '127.0.0.1',
  port:     3306,
  user:     'root',
  password: '',          // ← XAMPP por defecto no tiene contraseña
  database: 'bd_arrendamientos',
  waitForConnections: true,
  connectionLimit:    10,
  charset:  'utf8mb4',
});

// Probar conexión al iniciar
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a bd_arrendamientos (MySQL XAMPP)');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
    console.error('   → Verifica que XAMPP MySQL esté corriendo en puerto 3306');
  });

module.exports = pool;
