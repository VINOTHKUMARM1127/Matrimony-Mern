/**
 * Wedring Backend — Interests Controller
 */
import * as interestsService from './interests.service.js';
import { success, error } from '../../utils/response.js';

export async function send(req, res, next) {
  try {
    const data = await interestsService.sendInterest(req.user.id, req.params.targetUserId);
    return success(res, data, 'Interest sent', 201);
  } catch (err) { next(err); }
}

export async function getSent(req, res, next) {
  try {
    const data = await interestsService.getSentInterests(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function getReceived(req, res, next) {
  try {
    const data = await interestsService.getReceivedInterests(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function accept(req, res, next) {
  try {
    const data = await interestsService.acceptInterest(req.params.interestId, req.user.id);
    return success(res, data, 'Interest accepted');
  } catch (err) { next(err); }
}

export async function reject(req, res, next) {
  try {
    const data = await interestsService.rejectInterest(req.params.interestId, req.user.id);
    return success(res, data, 'Interest rejected');
  } catch (err) { next(err); }
}

export async function markNotInterested(req, res, next) {
  try {
    const data = await interestsService.markNotInterested(req.user.id, req.params.targetUserId);
    return success(res, data, 'Marked as not interested');
  } catch (err) { next(err); }
}

export async function getNotInterested(req, res, next) {
  try {
    const data = await interestsService.getNotInterested(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function removeNotInterested(req, res, next) {
  try {
    await interestsService.removeNotInterested(req.user.id, req.params.targetUserId);
    return success(res, null, 'Removed from not-interested list');
  } catch (err) { next(err); }
}

export async function checkStatus(req, res, next) {
  try {
    const data = await interestsService.checkStatus(req.user.id, req.params.targetUserId);
    return success(res, data);
  } catch (err) { next(err); }
}

export default { send, getSent, getReceived, accept, reject, markNotInterested, getNotInterested, removeNotInterested, checkStatus };
