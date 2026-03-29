const mysql = require('mysql2/promise');
const config = require('./index');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  connectionLimit: config.db.connectionLimit,
  waitForConnections: true,
  queueLimit: 0,
  // Prevent N+1: enable multi-statements only for migrations
  multipleStatements: false,
  timezone: '+00:00',
  charset: 'utf8mb4',
});

// Test connection on startup
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    logger.info('MySQL connected successfully');
    conn.release();
  } catch (err) {
    logger.error({ err }, 'MySQL connection failed');
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
