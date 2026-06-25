/**
 * Wedring Backend — Credits Controller
 */
import * as creditsService from './credits.service.js';
import { success, paginated } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export async function deductContact(req, res, next) {
  try {
    const data = await creditsService.deductContactCredit(req.user.id, req.params.targetUserId);
    return success(res, data, 'Contact details retrieved');
  } catch (err) { next(err); }
}

export async function deductHoroscope(req, res, next) {
  try {
    const data = await creditsService.deductHoroscopeCredit(req.user.id, req.params.targetUserId);
    return success(res, data, 'Horoscope details retrieved');
  } catch (err) { next(err); }
}

export async function getBalance(req, res, next) {
  try {
    const data = await creditsService.getBalance(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function getTransactions(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await creditsService.getTransactions(req.user.id, page, limit);
    return paginated(res, result.transactions, result.total, page, limit);
  } catch (err) { next(err); }
}

export default { deductContact, deductHoroscope, getBalance, getTransactions };
