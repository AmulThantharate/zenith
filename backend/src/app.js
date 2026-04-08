const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const RedisStore = require('connect-redis').default;

const config = require('./config');
const { redis } = require('./config/redis');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const aiRoutes = require('./routes/ai');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Bull Board (job monitoring UI)
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { todoQueue } = require('./jobs/todoQueue');

function createApp() {
  const app = express();

  // ─── Security Headers ────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: config.isDev ? false : undefined,
  }));

  // ─── CORS ────────────────────────────────────────────────────────────────────
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ─── Body Parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  // ─── HTTP Logging ────────────────────────────────────────────────────────────
  app.use(morgan(config.isDev ? 'dev' : 'combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));

  // ─── Redis Session Store ─────────────────────────────────────────────────────
  app.use(session({
    store: new RedisStore({ client: redis, prefix: 'sess:', ttl: config.session.ttl }),
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !config.isDev,
      sameSite: config.isDev ? 'lax' : 'strict',
      maxAge: config.session.ttl * 1000,
    },
  }));

  // ─── Bull Board ──────────────────────────────────────────────────────────────
  if (config.isDev) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    createBullBoard({ queues: [new BullMQAdapter(todoQueue)], serverAdapter });
    app.use('/admin/queues', serverAdapter.getRouter());
    logger.info('Bull Board available at /admin/queues');
  }

  // ─── Health Check ────────────────────────────────────────────────────────────
  app.get('/health', async (_req, res) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        redis: 'unknown'
      }
    };

    try {
      const { pool } = require('./config/database');
      await pool.query('SELECT 1');
      health.services.database = 'ok';
    } catch (err) {
      health.status = 'error';
      health.services.database = 'error';
      logger.error({ err }, 'Health check: Database failed');
    }

    try {
      const { redis } = require('./config/redis');
      await redis.ping();
      health.services.redis = 'ok';
    } catch (err) {
      health.status = 'error';
      health.services.redis = 'error';
      logger.error({ err }, 'Health check: Redis failed');
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  });

  // ─── API Routes ──────────────────────────────────────────────────────────────
  app.use('/api/auth',  authRoutes);
  app.use('/api/todos', todoRoutes);
  app.use('/api/ai',    aiRoutes);

  // ─── Error Handling ──────────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
