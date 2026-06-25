/**
 * Wedring Backend — Admin Users Controller
 */
import * as usersService from './admin.users.service.js';
import { success, paginated } from '../../../utils/response.js';
import { parsePagination } from '../../../utils/pagination.js';

export async function dashboardStats(req, res, next) {
  try {
    const data = await usersService.getDashboardStats();
    return success(res, data);
  } catch (err) { next(err); }
}

export async function list(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await usersService.listUsers({ page, limit, tier: req.query.tier, search: req.query.search });
    return paginated(res, result.users, result.total, page, limit);
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const data = await usersService.getUserById(req.params.userId);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const data = await usersService.updateUser(req.params.userId, req.body);
    return success(res, data, 'User updated');
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const hard = req.query.hard === 'true';
    if (hard) {
      await usersService.hardDeleteUser(req.params.userId);
      return success(res, null, 'User permanently deleted');
    } else {
      await usersService.deleteUser(req.params.userId);
      return success(res, null, 'User deactivated');
    }
  } catch (err) { next(err); }
}

export async function cleanupIncomplete(req, res, next) {
  try {
    const count = await usersService.cleanupIncomplete();
    return success(res, { count }, `Cleaned up ${count} incomplete users`);
  } catch (err) { next(err); }
}

export async function addPhoto(req, res, next) {
  try {
    const data = await usersService.addPhoto(req.params.userId, req.body.photo_url);
    return success(res, data, 'Photo added');
  } catch (err) { next(err); }
}

export async function upgrade(req, res, next) {
  try {
    const data = await usersService.upgradeUser(req.params.userId, req.body.plan_id);
    return success(res, data, 'User upgraded');
  } catch (err) { next(err); }
}

export async function downgrade(req, res, next) {
  try {
    await usersService.downgradeUser(req.params.userId);
    return success(res, null, 'User downgraded to free');
  } catch (err) { next(err); }
}

export async function reset(req, res, next) {
  try {
    await usersService.resetUser(req.params.userId);
    return success(res, null, 'User profile reset');
  } catch (err) { next(err); }
}

export default { dashboardStats, list, getById, update, remove, cleanupIncomplete, addPhoto, upgrade, downgrade, reset };
