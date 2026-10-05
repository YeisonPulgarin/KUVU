const mysql = require('mysql2/promise');

const config = {
  host:     process.env.MYSQLHOST     || '127.0.0.1',
  port:     process.env.MYSQLPORT     || 3306,
  user:     process.env.MYSQLUSER     || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'bd_arrendamientos',
};

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit:    10,
  charset:  'utf8mb4',
});

/**
 * Verifies the database is reachable. Takes the pool as an argument so tests
 * can inject a double instead of opening a real connection.
 */
async function checkConnection(targetPool = pool) {
  const conn = await targetPool.getConnection();
  conn.release();
}

module.exports = pool;
module.exports.checkConnection = checkConnection;
module.exports.config = config;
