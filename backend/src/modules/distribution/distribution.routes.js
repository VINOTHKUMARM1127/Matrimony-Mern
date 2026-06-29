/**
 * Wedring Backend — Distribution Routes
 * Mostly admin-only; internal methods are called by services/cron.
 */
import { Router } from 'express';
import auth from '../../middleware/auth.js';
import adminAuth from '../../middleware/adminAuth.js';
import * as distributionController from './distribution.controller.js';
import * as matchesController from '../matches/matches.controller.js';

const router = Router();

// Proxy for app backward compatibility (old distribution routes)
router.get('/all-matches', auth, matchesController.getAllMatches);
router.get('/daily', auth, matchesController.getDailyUpdates);

// Admin-only manual distribution
router.post('/manual', auth, adminAuth, distributionController.manualDistribution);

export default router;
