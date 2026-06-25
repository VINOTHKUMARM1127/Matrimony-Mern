/**
 * Wedring Backend — Notifications Routes
 */
import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as notificationsController from './notifications.controller.js';

const router = Router();

router.post('/register-token', auth, notificationsController.registerToken);
router.get('/', auth, notificationsController.list);

export default router;
