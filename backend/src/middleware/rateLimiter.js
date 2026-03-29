const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redis } = require('../config/redis');
const config = require('../config');

const createLimiter = (options = {}) =>
  rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.',
    },
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: `rl:${options.prefix || 'global'}:`,
    }),
  });

// Strict limiter for auth endpoints
const authLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 20, prefix: 'auth' });

// Standard API limiter
const apiLimiter = createLimiter({ prefix: 'api' });

module.exports = { authLimiter, apiLimiter };
