const { pool } = require('../config/database');

// Allowed sort columns — prevent SQL injection via whitelist
const SORT_COLUMNS = {
  createdAt: 't.created_at',
  dueDate: 't.due_date',
  priority: "FIELD(t.priority, 'high', 'medium', 'low')",
  title: 't.title',
};

class TodoRepository {
  /**
   * Paginated list with optional filters.
   * Uses a single COUNT(*) OVER() window function to avoid a second query.
   */
  async findAllByUser(userId, { page, limit, search, priority, completed, sortBy, order }) {
    const offset = (page - 1) * limit;
    const sortCol = SORT_COLUMNS[sortBy] || 't.created_at';
    const safeOrder = order === 'asc' ? 'ASC' : 'DESC';

    const conditions = ['t.user_id = ?'];
    const params = [userId];

    if (search) {
      conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (priority !== 'all') {
      conditions.push('t.priority = ?');
      params.push(priority);
    }

    if (completed !== 'all') {
      conditions.push('t.completed = ?');
      params.push(completed === 'true' ? 1 : 0);
    }

    const where = conditions.join(' AND ');

    // Single query with window function — avoids N+1 count query
    const sql = `
      SELECT
        t.id, t.title, t.description, t.priority, t.completed,
        t.due_date, t.tags, t.created_at, t.updated_at,
        COUNT(*) OVER() AS total_count
      FROM todos t
      WHERE ${where}
      ORDER BY ${sortCol} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);

    const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
    const data = rows.map(({ total_count, ...todo }) => ({
      ...todo,
      tags: typeof todo.tags === 'string' ? JSON.parse(todo.tags) : (todo.tags || []),
      completed: Boolean(todo.completed),
    }));

    return { data, total };
  }

  async findById(id, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!rows[0]) return null;
    const todo = rows[0];
    return {
      ...todo,
      tags: typeof todo.tags === 'string' ? JSON.parse(todo.tags) : (todo.tags || []),
      completed: Boolean(todo.completed),
    };
  }

  async create(userId, { title, description, priority, dueDate, tags }) {
    const [result] = await pool.query(
      `INSERT INTO todos (user_id, title, description, priority, due_date, tags)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title, description, priority, dueDate || null, JSON.stringify(tags)]
    );
    return this.findById(result.insertId, userId);
  }

  async update(id, userId, fields) {
    const allowed = ['title', 'description', 'priority', 'due_date', 'tags', 'completed'];
    const updates = [];
    const params = [];

    if (fields.title !== undefined) { updates.push('title = ?'); params.push(fields.title); }
    if (fields.description !== undefined) { updates.push('description = ?'); params.push(fields.description); }
    if (fields.priority !== undefined) { updates.push('priority = ?'); params.push(fields.priority); }
    if (fields.dueDate !== undefined) { updates.push('due_date = ?'); params.push(fields.dueDate); }
    if (fields.tags !== undefined) { updates.push('tags = ?'); params.push(JSON.stringify(fields.tags)); }
    if (fields.completed !== undefined) { updates.push('completed = ?'); params.push(fields.completed ? 1 : 0); }

    if (updates.length === 0) return this.findById(id, userId);

    updates.push('updated_at = NOW()');
    params.push(id, userId);

    await pool.query(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );
    return this.findById(id, userId);
  }

  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  async getStats(userId) {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(completed = 1) AS completed,
         SUM(completed = 0) AS pending,
         SUM(priority = 'high' AND completed = 0) AS \`high_priority\`
       FROM todos WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  }
}

module.exports = new TodoRepository();
