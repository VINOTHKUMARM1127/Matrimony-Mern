/**
 * Wedring Backend — Membership Routes
 */
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import auth from '../../middleware/auth.js';
import * as membershipController from './membership.controller.js';

const router = Router();

const purchaseSchema = z.object({
  plan_id: z.string().uuid(),
  payment_ref: z.string().optional(),
  gateway: z.string().optional(),
});

router.get('/plans', membershipController.getPlans);
router.get('/my-plan', auth, membershipController.getMyPlan);
router.post('/purchase', auth, validate(purchaseSchema), membershipController.purchase);
router.get('/history', auth, membershipController.getHistory);

export default router;
