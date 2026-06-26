/**
 * Wedring Backend — Firebase Admin SDK Configuration
 *
 * Initialises Firebase Admin for FCM push notifications.
 * Degrades gracefully if no service account is configured.
 */
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import env from './env.js';
import logger from '../utils/logger.js';

let firebaseInitialised = false;

try {
  let serviceAccount = null;

  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Try parsing as inline JSON first, then as file path
    try {
      serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch {
      // Treat as file path
      const raw = readFileSync(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'utf-8');
      serviceAccount = JSON.parse(raw);
    }
  } else {
    // Try default file location
    try {
      const raw = readFileSync('firebase-service-account.json', 'utf-8');
      serviceAccount = JSON.parse(raw);
    } catch {
      // No Firebase config found
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialised = true;
    logger.info('Firebase Admin SDK initialised');
  } else {
    logger.warn('Firebase not configured — push notifications disabled');
  }
} catch (err) {
  logger.error('Firebase initialisation failed:', err.message);
}

export const isFirebaseReady = () => firebaseInitialised;
export const messaging = () => {
  if (!firebaseInitialised) return null;
  return admin.messaging();
};

export default { isFirebaseReady, messaging };
