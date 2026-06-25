/**
 * Wedring Backend — Admin Routes Aggregator
 */
import { Router } from 'express';
import auth from '../../middleware/auth.js';
import adminAuth from '../../middleware/adminAuth.js';
import * as usersController from './users/admin.users.controller.js';
import * as membershipController from './membership/admin.membership.controller.js';
import * as distributionController from './distribution/admin.distribution.controller.js';
import * as paymentsController from './payments/admin.payments.controller.js';
import * as reportsController from './reports/admin.reports.controller.js';
import * as bulkImportController from './bulkImport/admin.bulkImport.controller.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// All admin routes require auth + adminAuth
router.use(auth, adminAuth);

// --- Dashboard ---
router.get('/dashboard/stats', usersController.dashboardStats);

// --- Users ---
router.get('/users', usersController.list);
router.post('/users/cleanup-incomplete', usersController.cleanupIncomplete);
router.get('/users/:userId', usersController.getById);
router.put('/users/:userId', usersController.update);
router.delete('/users/:userId', usersController.remove);
router.post('/users/:userId/photos', usersController.addPhoto);
router.post('/users/:userId/upgrade', usersController.upgrade);
router.post('/users/:userId/downgrade', usersController.downgrade);
router.post('/users/:userId/reset', usersController.reset);

// --- Membership Plans ---
router.get('/plans', membershipController.list);
router.post('/plans', membershipController.create);
router.put('/plans/:planId', membershipController.update);
router.delete('/plans/:planId', membershipController.remove);

// --- Payments ---
router.get('/payments', paymentsController.list);
router.put('/payments/:paymentId/verify', paymentsController.verify);
router.put('/payments/:paymentId/reject', paymentsController.reject);

// --- Distribution Config ---
router.get('/distribution/config', distributionController.getConfig);
router.put('/distribution/config/:tier', distributionController.updateConfig);
router.post('/distribution/manual', distributionController.manual);

// --- Bulk Import ---
router.post('/import/users', upload.single('file'), bulkImportController.importUsers);

// --- Reports ---
router.get('/reports/users', reportsController.usersReport);
router.get('/reports/memberships', reportsController.membershipsReport);
router.get('/reports/payments', reportsController.paymentsReport);
router.get('/reports/purchase-history', reportsController.purchaseHistory);

export default router;
