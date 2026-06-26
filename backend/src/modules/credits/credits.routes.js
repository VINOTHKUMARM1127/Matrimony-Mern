/**
 * Wedring Backend — Credits Routes
 */
import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as creditsController from './credits.controller.js';

const router = Router();

router.post('/deduct/contact/:targetUserId', auth, creditsController.deductContact);
router.post('/deduct/horoscope/:targetUserId', auth, creditsController.deductHoroscope);
router.get('/balance', auth, creditsController.getBalance);
router.get('/transactions', auth, creditsController.getTransactions);

export default router;
