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
  app.get('/health', (_req, res) => res.json({ status: 'ok', env: config.env }));

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
