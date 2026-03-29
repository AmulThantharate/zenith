const http = require('http');
const { createApp } = require('./app');
const { testConnection } = require('./config/database');
const { redis } = require('./config/redis');
const { initSocket } = require('./socket');
const todoService = require('./services/todoService');
const logger = require('./utils/logger');
const config = require('./config');

async function bootstrap() {
  // 1. Verify DB connection
  await testConnection();

  // 2. Connect Redis
  await redis.connect().catch(() => {}); // already lazy, errors handled via events

  // 3. Build Express app + HTTP server
  const app = createApp();
  const server = http.createServer(app);

  // 4. Init Socket.io and inject into TodoService
  const io = initSocket(server);
  todoService.setIO(io);

  // 5. Start listening
  server.listen(config.server.port, () => {
    logger.info(`Server running on port ${config.server.port} [${config.env}]`);
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await redis.quit();
        logger.info('Redis disconnected');
      } catch (_) {}
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception — shutting down');
    process.exit(1);
  });
}

bootstrap();
