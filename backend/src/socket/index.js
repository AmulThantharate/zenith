const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Initialises Socket.io on the HTTP server.
 * Each authenticated user joins a private room: user:<userId>
 * The TodoService emits to these rooms for real-time updates.
 */
function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Reconnection handled by client
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // ─── Auth Middleware ───────────────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.sub;
      socket.userName = decoded.name;
      next();
    } catch (err) {
      next(new Error(err.message));
    }
  });

  // ─── Connection ────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const room = `user:${socket.userId}`;
    socket.join(room);

    logger.info({ userId: socket.userId, socketId: socket.id }, 'Socket connected');

    socket.on('disconnect', (reason) => {
      logger.info({ userId: socket.userId, reason }, 'Socket disconnected');
    });

    socket.on('error', (err) => {
      logger.error({ userId: socket.userId, err }, 'Socket error');
    });
  });

  return io;
}

module.exports = { initSocket };
