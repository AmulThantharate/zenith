const { verifyAccessToken } = require('../utils/jwt');
const { AppError, catchAsync } = require('../utils/helpers');

/**
 * Extracts and verifies the JWT access token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const authenticate = catchAsync(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401, 'NO_TOKEN');
  }

  const token = authHeader.slice(7);
  const decoded = verifyAccessToken(token);

  req.user = { id: decoded.sub, email: decoded.email, name: decoded.name };
  next();
});

module.exports = { authenticate };
