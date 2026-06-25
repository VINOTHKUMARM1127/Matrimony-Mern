/**
 * Wedring Backend — Admin Distribution Controller
 */
import * as distributionService from './admin.distribution.service.js';
import { success } from '../../../utils/response.js';

export async function getConfig(req, res, next) {
  try {
    const data = await distributionService.getDistributionConfig();
    return success(res, data);
  } catch (err) { next(err); }
}

export async function updateConfig(req, res, next) {
  try {
    const data = await distributionService.updateDistributionConfig(req.params.tier, req.body);
    return success(res, data, 'Distribution config updated');
  } catch (err) { next(err); }
}

export async function manual(req, res, next) {
  try {
    const data = await distributionService.triggerManualDistribution(req.body);
    return success(res, data, 'Manual distribution complete');
  } catch (err) { next(err); }
}

export default { getConfig, updateConfig, manual };
