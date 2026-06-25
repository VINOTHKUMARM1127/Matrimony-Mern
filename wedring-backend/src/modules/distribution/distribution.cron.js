/**
 * Wedring Backend — Distribution Cron Job
 *
 * Daily distribution at midnight IST for all active users.
 */
import cron from 'node-cron';
import { supabaseAdmin } from '../../config/supabase.js';
import { runDailyDistribution } from './distribution.service.js';
import { checkExpiredMemberships } from '../membership/membership.service.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

/**
 * Register all cron jobs
 */
export function registerCronJobs() {
  // Daily distribution at midnight
  cron.schedule(env.DAILY_DISTRIBUTION_CRON, async () => {
    logger.info('🕛 Daily distribution cron started');
    const startTime = Date.now();

    try {
      // Fetch all active users with their tier
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, membership_tier')
        .eq('is_active', true);

      if (error) {
        logger.error('Failed to fetch users for distribution:', error.message);
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const user of (users || [])) {
        try {
          await runDailyDistribution(user.id, user.membership_tier || 'free');
          successCount++;
        } catch (err) {
          failCount++;
          logger.error(`Daily distribution failed for user ${user.id}:`, err.message);
        }
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      logger.info(`✅ Daily distribution complete: ${successCount} success, ${failCount} failed (${elapsed}s)`);
    } catch (err) {
      logger.error('Daily distribution cron error:', err.message);
    }
  }, {
    timezone: 'Asia/Kolkata',
  });

  logger.info(`📅 Daily distribution cron registered: ${env.DAILY_DISTRIBUTION_CRON}`);

  // Hourly membership expiry check
  cron.schedule(env.MEMBERSHIP_CHECK_CRON, async () => {
    logger.info('⏰ Membership expiry check started');
    try {
      const result = await checkExpiredMemberships();
      logger.info(`✅ Membership check complete: ${result?.processed || 0} processed`);
    } catch (err) {
      logger.error('Membership check cron error:', err.message);
    }
  }, {
    timezone: 'Asia/Kolkata',
  });

  logger.info(`📅 Membership expiry cron registered: ${env.MEMBERSHIP_CHECK_CRON}`);
}

export default { registerCronJobs };
