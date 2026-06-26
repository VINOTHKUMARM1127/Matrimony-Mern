/**
 * Wedring Backend — Notifications Service
 *
 * Sends FCM push notifications and logs them in the notifications table.
 */
import { messaging, isFirebaseReady } from '../../config/firebase.js';
import { supabaseAdmin } from '../../config/supabase.js';
import logger from '../../utils/logger.js';

/**
 * Send a push notification to a user.
 * @param {string} userId - Target user ID
 * @param {object} payload - { title, body, type, data }
 */
export async function sendPush(userId, { title, body, type = 'general', data = {} }) {
  try {
    // Fetch user's FCM token
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select('fcm_token')
      .eq('id', userId)
      .single();

    if (userErr || !user?.fcm_token) {
      logger.debug(`No FCM token for user ${userId}, skipping push`);
      // Still log the notification
      await logNotification(userId, { title, body, type, data, sent: false });
      return false;
    }

    // Send via Firebase
    if (isFirebaseReady()) {
      try {
        await messaging().send({
          token: user.fcm_token,
          notification: { title, body },
          data: { type, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) },
          android: { priority: 'high' },
          apns: { payload: { aps: { sound: 'default' } } },
        });
        logger.info(`Push sent to ${userId}: ${title}`);
      } catch (fcmErr) {
        logger.warn(`FCM send failed for ${userId}:`, fcmErr.message);
      }
    }

    // Log notification
    await logNotification(userId, { title, body, type, data, sent: true });
    return true;
  } catch (err) {
    logger.error('sendPush error:', err.message);
    return false;
  }
}

/**
 * Log notification in the database
 */
async function logNotification(userId, { title, body, type, data, sent }) {
  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title,
      body,
      type,
      data,
      sent_at: sent ? new Date().toISOString() : null,
    });
  } catch (err) {
    logger.warn('Failed to log notification:', err.message);
  }
}

/**
 * Get notification history for a user
 */
export async function getNotificationHistory(userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { notifications: data || [], total: count || 0 };
}

/**
 * Register / update FCM token for a user
 */
export async function registerToken(userId, fcmToken) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ fcm_token: fcmToken, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
  return true;
}

export default { sendPush, getNotificationHistory, registerToken };
