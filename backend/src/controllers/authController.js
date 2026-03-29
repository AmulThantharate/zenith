const authService = require('../services/authService');
const { catchAsync } = require('../utils/helpers');

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, ...result });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, ...result });
});

const refresh = catchAsync(async (req, res) => {
  const result = await authService.refreshTokens(req.body.refreshToken);
  res.status(200).json({ success: true, ...result });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id, req.body.refreshToken);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const logoutAll = catchAsync(async (req, res) => {
  await authService.logoutAll(req.user.id);
  res.status(200).json({ success: true, message: 'All sessions revoked' });
});

const me = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = { register, login, refresh, logout, logoutAll, me };
