const router = require('express').Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate, apiLimiter);

router.post('/chat', aiController.chat);

module.exports = router;
