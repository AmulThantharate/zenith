const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../utils/helpers');

class AuthService {
  async register({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ name, email, passwordHash });

    return this._generateTokenPair(user);
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

    const safeUser = { id: user.id, name: user.name, email: user.email };
    return this._generateTokenPair(safeUser);
  }

  async refreshTokens(rawRefreshToken) {
    const decoded = verifyRefreshToken(rawRefreshToken);
    const tokenHash = this._hashToken(rawRefreshToken);

    const stored = await userRepository.findRefreshToken(decoded.sub, tokenHash);
    if (!stored) throw new AppError('Refresh token revoked or not found', 401, 'REFRESH_INVALID');

    // Rotate: delete old, issue new pair
    await userRepository.deleteRefreshToken(decoded.sub, tokenHash);

    const user = await userRepository.findById(decoded.sub);
    if (!user) throw new AppError('User not found', 401, 'USER_NOT_FOUND');

    return this._generateTokenPair(user);
  }

  async logout(userId, rawRefreshToken) {
    if (rawRefreshToken) {
      const tokenHash = this._hashToken(rawRefreshToken);
      await userRepository.deleteRefreshToken(userId, tokenHash);
    }
  }

  async logoutAll(userId) {
    await userRepository.deleteAllRefreshTokens(userId);
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  async _generateTokenPair(user) {
    const payload = { sub: user.id, email: user.email, name: user.name };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const tokenHash = this._hashToken(refreshToken);

    // Store hashed refresh token (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.storeRefreshToken(user.id, tokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  _hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

module.exports = new AuthService();
