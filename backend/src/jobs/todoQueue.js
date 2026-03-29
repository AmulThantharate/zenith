const { Queue, Worker, QueueEvents } = require('bullmq');
const { bullRedis } = require('../config/redis');
const logger = require('../utils/logger');

const connection = bullRedis;

// ─── Queue ─────────────────────────────────────────────────────────────────────

const todoQueue = new Queue('todo-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});

// ─── Add Job Helpers ───────────────────────────────────────────────────────────

const addTodoJob = async (type, data, opts = {}) => {
  return todoQueue.add(type, data, opts);
};

// ─── Worker ────────────────────────────────────────────────────────────────────

const worker = new Worker(
  'todo-jobs',
  async (job) => {
    logger.info({ jobId: job.id, type: job.name }, 'Processing job');

    switch (job.name) {
      case 'reminder': {
        // Simulate sending an email/push notification
        const { todoId, userId, title, dueDate } = job.data;
        logger.info({ todoId, userId, title, dueDate }, 'Sending reminder notification');
        // TODO: integrate your mailer here (e.g. nodemailer)
        break;
      }

      case 'cleanup': {
        // Simulate periodic cleanup of old completed todos
        logger.info('Running scheduled cleanup job');
        break;
      }

      default:
        logger.warn({ jobName: job.name }, 'Unknown job type, skipping');
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: { max: 10, duration: 1000 }, // max 10 jobs/sec
  }
);

// ─── Worker Events ─────────────────────────────────────────────────────────────

worker.on('completed', (job) => {
  logger.info({ jobId: job.id, type: job.name }, 'Job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, type: job?.name, err }, 'Job failed');
});

worker.on('error', (err) => {
  logger.error({ err }, 'Worker error');
});

// ─── Queue Events (for monitoring) ────────────────────────────────────────────

const queueEvents = new QueueEvents('todo-jobs', { connection: bullRedis });

queueEvents.on('stalled', ({ jobId }) => {
  logger.warn({ jobId }, 'Job stalled');
});

module.exports = { todoQueue, addTodoJob, worker };
