const todoService = require('../services/todoService');
const { catchAsync, paginatedResponse } = require('../utils/helpers');

const list = catchAsync(async (req, res) => {
  const { data, total } = await todoService.getTodos(req.user.id, req.query);
  res.status(200).json({
    success: true,
    ...paginatedResponse({ data, total, page: req.query.page, limit: req.query.limit }),
  });
});

const getOne = catchAsync(async (req, res) => {
  const todo = await todoService.getById(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: todo });
});

const create = catchAsync(async (req, res) => {
  const todo = await todoService.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: todo });
});

const update = catchAsync(async (req, res) => {
  const todo = await todoService.update(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, data: todo });
});

const remove = catchAsync(async (req, res) => {
  await todoService.delete(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'Todo deleted' });
});

const stats = catchAsync(async (req, res) => {
  const data = await todoService.getStats(req.user.id);
  res.status(200).json({ success: true, data });
});

module.exports = { list, getOne, create, update, remove, stats };
