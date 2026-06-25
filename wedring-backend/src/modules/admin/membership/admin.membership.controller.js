/**
 * Wedring Backend — Admin Membership Controller
 */
import * as membershipService from './admin.membership.service.js';
import { success } from '../../../utils/response.js';

export async function list(req, res, next) {
  try {
    const data = await membershipService.listPlans();
    return success(res, data);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const data = await membershipService.createPlan(req.body);
    return success(res, data, 'Plan created', 201);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const data = await membershipService.updatePlan(req.params.planId, req.body);
    return success(res, data, 'Plan updated');
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await membershipService.deletePlan(req.params.planId);
    return success(res, null, 'Plan deactivated');
  } catch (err) { next(err); }
}

export default { list, create, update, remove };
