/**
 * Wedring Matrimony — Backend Server Entry Point
 *
 * Starts Express server and registers cron jobs.
 */
import app, { logRoutes } from './src/app.js';
import env from './src/config/env.js';
import { registerCronJobs } from './src/jobs/dailyDistribution.js';
import logger from './src/utils/logger.js';

const PORT = parseInt(env.PORT, 10) || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Wedring Backend running on port ${PORT} [${env.NODE_ENV}]`);
  logRoutes();

  // Register cron jobs
  registerCronJobs();

  logger.info('✅ Server ready');
});

// Handle uncaught errors
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  process.exit(1);
});
