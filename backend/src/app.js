/**
 * Wedring Backend — Express App Setup
 *
 * Configures CORS, Helmet, Morgan, JSON parsing, routes, and error handling.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import photosRoutes from './modules/photos/photos.routes.js';
import matchesRoutes from './modules/matches/matches.routes.js';
import interestsRoutes from './modules/interests/interests.routes.js';
import membershipRoutes from './modules/membership/membership.routes.js';
import creditsRoutes from './modules/credits/credits.routes.js';
import distributionRoutes from './modules/distribution/distribution.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(morgan('short'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (applied globally, auth routes have stricter limits)
app.use('/api', generalLimiter);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/interests', interestsRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --- Global Error Handler ---
app.use(errorHandler);

// Log all registered routes
function logRoutes() {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router' && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const prefix = middleware.regexp.toString().includes('api') ? '' : '';
          routes.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${prefix}${handler.route.path}`);
        }
      });
    }
  });
  logger.info(`📍 ${routes.length} routes registered`);
}

export { logRoutes };
export default app;
