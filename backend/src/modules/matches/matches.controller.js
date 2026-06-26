/**
 * Wedring Backend — Matches Controller
 */
import * as matchesService from './matches.service.js';
import { success, paginated } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export async function getAllMatches(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await matchesService.getAllMatches(req.user.id, page, limit);
    return paginated(res, result.matches, result.total, page, limit);
  } catch (err) { next(err); }
}

export async function getDailyUpdates(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await matchesService.getDailyUpdates(req.user.id, page, limit);
    return paginated(res, result.matches, result.total, page, limit);
  } catch (err) { next(err); }
}

export async function getCompatibility(req, res, next) {
  try {
    const result = await matchesService.getCompatibility(req.user.id, req.params.userId);
    return success(res, result);
  } catch (err) { next(err); }
}

export default { getAllMatches, getDailyUpdates, getCompatibility };
