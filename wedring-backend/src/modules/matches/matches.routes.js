/**
 * Wedring Backend — Matches Routes
 */
import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as matchesController from './matches.controller.js';

const router = Router();

router.get('/all-matches', auth, matchesController.getAllMatches);
router.get('/daily-updates', auth, matchesController.getDailyUpdates);
router.get('/compatibility/:userId', auth, matchesController.getCompatibility);

export default router;
