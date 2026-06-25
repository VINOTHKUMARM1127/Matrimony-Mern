/**
 * Wedring Backend — Interests Routes
 */
import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as interestsController from './interests.controller.js';

const router = Router();

router.post('/send/:targetUserId', auth, interestsController.send);
router.get('/sent', auth, interestsController.getSent);
router.get('/received', auth, interestsController.getReceived);
router.put('/:interestId/accept', auth, interestsController.accept);
router.put('/:interestId/reject', auth, interestsController.reject);
router.get('/status/:targetUserId', auth, interestsController.checkStatus);
router.post('/not-interested/:targetUserId', auth, interestsController.markNotInterested);
router.get('/not-interested', auth, interestsController.getNotInterested);
router.delete('/not-interested/:targetUserId', auth, interestsController.removeNotInterested);

export default router;
