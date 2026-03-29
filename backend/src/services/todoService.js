const todoRepository = require('../repositories/todoRepository');
const { AppError } = require('../utils/helpers');
const { redis } = require('../config/redis');
const { addTodoJob } = require('../jobs/todoQueue');

const CACHE_TTL = 60; // seconds

class TodoService {
  constructor() {
    // Socket.io instance injected at server startup
    this.io = null;
  }

  setIO(io) {
    this.io = io;
  }

  async getTodos(userId, query) {
    // Cache key encodes all query params
    const cacheKey = `todos:${userId}:${JSON.stringify(query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const result = await todoRepository.findAllByUser(userId, query);

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async getById(id, userId) {
    const todo = await todoRepository.findById(id, userId);
    if (!todo) throw new AppError('Todo not found', 404, 'TODO_NOT_FOUND');
    return todo;
  }

  async create(userId, data) {
    const todo = await todoRepository.create(userId, data);

    await this._invalidateUserCache(userId);
    this._emit(userId, 'todo:created', todo);

    // Enqueue background job (e.g. send email reminder)
    if (todo.due_date) {
      await addTodoJob('reminder', { todoId: todo.id, userId, title: todo.title, dueDate: todo.due_date });
    }

    return todo;
  }

  async update(id, userId, data) {
    const existing = await todoRepository.findById(id, userId);
    if (!existing) throw new AppError('Todo not found', 404, 'TODO_NOT_FOUND');

    const updated = await todoRepository.update(id, userId, data);

    await this._invalidateUserCache(userId);
    this._emit(userId, 'todo:updated', updated);

    return updated;
  }

  async delete(id, userId) {
    const deleted = await todoRepository.delete(id, userId);
    if (!deleted) throw new AppError('Todo not found', 404, 'TODO_NOT_FOUND');

    await this._invalidateUserCache(userId);
    this._emit(userId, 'todo:deleted', { id });
  }

  async getStats(userId) {
    const cacheKey = `stats:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const stats = await todoRepository.getStats(userId);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(stats));
    return stats;
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  async _invalidateUserCache(userId) {
    // Scan and delete all keys matching todos:<userId>:*
    const pattern = `todos:${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);

    // Also invalidate stats
    await redis.del(`stats:${userId}`);
  }

  _emit(userId, event, payload) {
    if (this.io) {
      // Room-based: each user joins room `user:<id>` on socket connect
      this.io.to(`user:${userId}`).emit(event, payload);
    }
  }
}

module.exports = new TodoService();
