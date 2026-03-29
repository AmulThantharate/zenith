const logger = require('../utils/logger');
const config = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Default to 500
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'A record with that value already exists';
  }

  // Non-operational / unexpected errors — hide details in production
  if (!err.isOperational) {
    logger.error({ err, req: { method: req.method, url: req.url, body: req.body } }, 'Unhandled error');

    if (!config.isDev) {
      message = 'An unexpected error occurred';
    }
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(config.isDev && !err.isOperational && { stack: err.stack }),
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

module.exports = { errorHandler, notFoundHandler };
