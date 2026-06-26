/**
 * Wedring Backend — Admin Reports Controller
 */
import * as reportsService from './admin.reports.service.js';
import { success } from '../../../utils/response.js';

export async function usersReport(req, res, next) {
  try {
    const data = await reportsService.getUsersReport(req.query);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function membershipsReport(req, res, next) {
  try {
    const data = await reportsService.getMembershipsReport(req.query);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function paymentsReport(req, res, next) {
  try {
    const data = await reportsService.getPaymentsReport(req.query);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function purchaseHistory(req, res, next) {
  try {
    const data = await reportsService.getPurchaseHistory(req.query);
    return success(res, data);
  } catch (err) { next(err); }
}

export default { usersReport, membershipsReport, paymentsReport, purchaseHistory };
