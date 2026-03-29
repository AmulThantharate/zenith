const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('./helpers');

const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'todo-api',
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'todo-api',
  });

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret, { issuer: 'todo-api' });
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
    throw new AppError('Invalid access token', 401, 'TOKEN_INVALID');
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, { issuer: 'todo-api' });
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      throw new AppError('Refresh token expired', 401, 'REFRESH_EXPIRED');
    throw new AppError('Invalid refresh token', 401, 'REFRESH_INVALID');
  }
};

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
