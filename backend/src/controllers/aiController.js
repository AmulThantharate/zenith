const aiService = require('../services/aiService');
const { catchAsync, AppError } = require('../utils/helpers');

const chat = catchAsync(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    throw new AppError('Message is required', 400);
  }

  const reply = await aiService.chat(req.user.id, message);
  res.status(200).json({ success: true, data: reply });
});

module.exports = { chat };
