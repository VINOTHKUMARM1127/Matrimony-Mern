/**
 * Wedring Backend — Admin Payments Controller
 */
import * as paymentsService from './admin.payments.service.js';
import { success, paginated } from '../../../utils/response.js';
import { parsePagination } from '../../../utils/pagination.js';

export async function list(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await paymentsService.listPayments({ page, limit, status: req.query.status });
    return paginated(res, result.payments, result.total, page, limit);
  } catch (err) { next(err); }
}

export async function verify(req, res, next) {
  try {
    const data = await paymentsService.verifyPayment(req.params.paymentId, req.user.id);
    return success(res, data, 'Payment verified');
  } catch (err) { next(err); }
}

export async function reject(req, res, next) {
  try {
    const data = await paymentsService.rejectPayment(req.params.paymentId, req.body.reason);
    return success(res, data, 'Payment rejected');
  } catch (err) { next(err); }
}

export default { list, verify, reject };
