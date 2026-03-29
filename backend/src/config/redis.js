const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  ...(config.redis.password && { password: config.redis.password }),
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 5) {
      logger.error('Redis: max retries reached, giving up');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
};

// Primary client (app + caching)
const redis = new Redis(redisConfig);

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

// Separate client for BullMQ (must not share with subscriber)
const bullRedis = new Redis(redisConfig);

module.exports = { redis, bullRedis };
