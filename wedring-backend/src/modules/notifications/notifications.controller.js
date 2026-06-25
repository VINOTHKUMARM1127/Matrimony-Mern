/**
 * Wedring Backend — Notifications Controller
 */
import * as notificationsService from './notifications.service.js';
import { success, error, paginated } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

/**
 * POST /api/notifications/register-token
 */
export async function registerToken(req, res, next) {
  try {
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return error(res, 'fcm_token is required', 400);
    }

    await notificationsService.registerToken(req.user.id, fcm_token);
    return success(res, null, 'FCM token registered');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notifications
 */
export async function list(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await notificationsService.getNotificationHistory(req.user.id, page, limit);
    return paginated(res, result.notifications, result.total, page, limit);
  } catch (err) {
    next(err);
  }
}

export default { registerToken, list };
