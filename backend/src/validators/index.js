const Joi = require('joi');

// ─── Auth ──────────────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(72).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// ─── Todos ─────────────────────────────────────────────────────────────────────

const createTodoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(5000).allow('').default(''),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.date().allow(null).default(null),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10).default([]),
});

const updateTodoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255),
  description: Joi.string().trim().max(5000).allow(''),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().allow(null),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10),
  completed: Joi.boolean(),
}).min(1); // at least one field required

const todoQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(100).allow('').default(''),
  priority: Joi.string().valid('low', 'medium', 'high', 'all').default('all'),
  completed: Joi.string().valid('true', 'false', 'all').default('all'),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'priority', 'title').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

const logger = require('../utils/logger');

// ─── Validator Middleware Factory ──────────────────────────────────────────────

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    logger.warn({ details, source, body: req[source] }, 'Validation failed');
    return res.status(422).json({ success: false, code: 'VALIDATION_ERROR', errors: details });
  }

  req[source] = value;
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  createTodoSchema,
  updateTodoSchema,
  todoQuerySchema,
};
