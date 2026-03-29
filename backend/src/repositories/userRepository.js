const { pool } = require('../config/database');

class UserRepository {
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async create({ name, email, passwordHash }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    return this.findById(result.insertId);
  }

  async storeRefreshToken(userId, tokenHash, expiresAt) {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)`,
      [userId, tokenHash, expiresAt]
    );
  }

  async findRefreshToken(userId, tokenHash) {
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()',
      [userId, tokenHash]
    );
    return rows[0] || null;
  }

  async deleteRefreshToken(userId, tokenHash) {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = ? AND token_hash = ?',
      [userId, tokenHash]
    );
  }

  async deleteAllRefreshTokens(userId) {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  }
}

module.exports = new UserRepository();
