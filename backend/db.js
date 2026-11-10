const mysql = require('mysql2/promise');

const config = {
  host:     process.env.MYSQLHOST     || '127.0.0.1',
  port:     process.env.MYSQLPORT     || 3306,
  user:     process.env.MYSQLUSER     || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'bd_arrendamientos',
};

// Cloud databases (Aiven, TiDB) require TLS. MYSQL_SSL_CA carries the provider's CA
// certificate (PEM); MYSQL_SSL=true alone verifies against the system CAs.
if (process.env.MYSQL_SSL_CA) {
  config.ssl = { ca: process.env.MYSQL_SSL_CA.replace(/\\n/g, '\n'), rejectUnauthorized: true };
} else if (process.env.MYSQL_SSL === 'true') {
  config.ssl = { rejectUnauthorized: true };
}

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
