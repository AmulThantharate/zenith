const router = require('express').Router();
const todoController = require('../controllers/todoController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  validate,
  createTodoSchema,
  updateTodoSchema,
  todoQuerySchema,
} = require('../validators');

// All todo routes require authentication
router.use(authenticate, apiLimiter);

router.get('/stats', todoController.stats);
router.get('/',      validate(todoQuerySchema, 'query'), todoController.list);
router.get('/:id',   todoController.getOne);
router.post('/',     validate(createTodoSchema), todoController.create);
router.patch('/:id', validate(updateTodoSchema), todoController.update);
router.delete('/:id', todoController.remove);

module.exports = router;
