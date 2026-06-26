/**
 * Wedring Backend — Distribution Controller
 */
import * as distributionService from './distribution.service.js';
import { success } from '../../utils/response.js';

export async function manualDistribution(req, res, next) {
  try {
    const data = await distributionService.manualDistribution(req.body);
    return success(res, data, 'Manual distribution complete');
  } catch (err) { next(err); }
}

export default { manualDistribution };
