/**
 * Wedring Backend — Membership Controller
 */
import * as membershipService from './membership.service.js';
import { success, error } from '../../utils/response.js';

export async function getPlans(req, res, next) {
  try {
    const data = await membershipService.getPlans();
    return success(res, data);
  } catch (err) { next(err); }
}

export async function getMyPlan(req, res, next) {
  try {
    const data = await membershipService.getMyPlan(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function purchase(req, res, next) {
  try {
    const data = await membershipService.purchase(req.user.id, req.body);
    return success(res, data, 'Purchase submitted', 201);
  } catch (err) { next(err); }
}

export async function getHistory(req, res, next) {
  try {
    const data = await membershipService.getHistory(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}

export default { getPlans, getMyPlan, purchase, getHistory };
