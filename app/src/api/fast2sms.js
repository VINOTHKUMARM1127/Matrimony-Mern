/**
 * Wedring Matrimony — Fast2SMS OTP API
 * Client-side OTP generation + Fast2SMS delivery for Indian mobile numbers.
 *
 * IMPORTANT: Fast2SMS only provides a SEND endpoint. There is no server-side
 * verify endpoint. We generate the OTP locally, send it via Fast2SMS, and
 * compare the user's input ourselves.
 *
 * TODO (production): Move OTP generation & verification to a Supabase Edge
 * Function so the OTP secret never lives on the client.
 */
import { FAST2SMS_API_KEY, FAST2SMS_BASE_URL } from '../utils/constants';

// ---------------------------------------------------------------------------
// In-memory OTP store  (phone → { otp, expiresAt, attempts, resendCount })
// ---------------------------------------------------------------------------
const otpStore = {};

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000;        // 5 minutes
const MAX_VERIFY_ATTEMPTS = 3;
const MAX_RESEND_ATTEMPTS = 3;
const RESEND_LOCKOUT_MS = 10 * 60 * 1000;   // 10 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a random numeric OTP of the given length.
 */
const generateOTP = (length = OTP_LENGTH) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
};

/**
 * Normalise an Indian mobile number to 10 digits (no country code).
 * Accepts: 9876543210, +919876543210, 919876543210, 09876543210
 */
const normalisePhone = (phone) => {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length >= 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length === 10) return digits;
  return digits.slice(-10); // best-effort fallback
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send an OTP to the given mobile number via Fast2SMS.
 *
 * @param {string} phone — Indian mobile number (any format)
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const sendOTP = async (phone) => {
  const mobile = normalisePhone(phone);

  if (mobile.length !== 10) {
    throw new Error('Please enter a valid 10-digit Indian mobile number.');
  }

  // ---- Resend rate-limit check ----
  const existing = otpStore[mobile];
  if (existing?.lockedUntil && Date.now() < existing.lockedUntil) {
    const minsLeft = Math.ceil((existing.lockedUntil - Date.now()) / 60000);
    throw new Error(`Too many attempts. Please try again in ${minsLeft} minute(s).`);
  }

  const resendCount = (existing?.resendCount || 0) + 1;
  if (resendCount > MAX_RESEND_ATTEMPTS) {
    otpStore[mobile] = {
      ...existing,
      lockedUntil: Date.now() + RESEND_LOCKOUT_MS,
      resendCount,
    };
    throw new Error('Too many OTP requests. Please try again after 10 minutes.');
  }

  // ---- Generate OTP ----
  const otp = generateOTP();

  // ---- Dev-mode bypass (skip real HTTP) ----
  if (__DEV__) {
    console.warn(`[Fast2SMS DEV] OTP for ${mobile}: ${otp}  (use 123456 to bypass)`);
    otpStore[mobile] = {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      attempts: 0,
      resendCount,
    };
    return { success: true, message: 'OTP sent (dev mode)' };
  }

  // ---- Production: call Fast2SMS ----
  if (!FAST2SMS_API_KEY) {
    throw new Error('Fast2SMS API key is not configured. Please add EXPO_PUBLIC_FAST2SMS_API_KEY to your .env file.');
  }

  try {
    const url = `${FAST2SMS_BASE_URL}?authorization=${encodeURIComponent(FAST2SMS_API_KEY)}&route=otp&variables_values=${otp}&flash=0&numbers=${mobile}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
      },
    });

    const data = await response.json();

    if (!response.ok || data.return === false) {
      const msg = data.message?.[0] || data.message || 'Failed to send OTP';
      throw new Error(msg);
    }

    // Store OTP locally for verification
    otpStore[mobile] = {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      attempts: 0,
      resendCount,
    };

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    // Network or quota errors
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      throw new Error('Could not send OTP. Please check your internet connection.');
    }
    throw error;
  }
};

/**
 * Verify the user-entered OTP against the stored value.
 *
 * @param {string} phone — Indian mobile number (any format)
 * @param {string} userOTP — 6-digit code entered by user
 * @returns {{ success: boolean, message: string }}
 */
export const verifyOTP = (phone, userOTP) => {
  const mobile = normalisePhone(phone);
  const entry = otpStore[mobile];

  if (!entry) {
    throw new Error('No OTP was sent to this number. Please request a new OTP.');
  }

  // ---- Expiry check ----
  if (Date.now() > entry.expiresAt) {
    delete otpStore[mobile];
    throw new Error('OTP has expired. Please tap Resend to get a new code.');
  }

  // ---- Attempt limit ----
  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    delete otpStore[mobile];
    throw new Error('Too many incorrect attempts. Please request a new OTP.');
  }

  // ---- Dev-mode shortcut ----
  if (__DEV__ && userOTP === '123456') {
    console.warn('[Fast2SMS DEV] OTP bypassed with 123456');
    delete otpStore[mobile];
    return { success: true, message: 'OTP verified (dev bypass)' };
  }

  // ---- Compare ----
  entry.attempts += 1;

  if (userOTP !== entry.otp) {
    const remaining = MAX_VERIFY_ATTEMPTS - entry.attempts;
    if (remaining <= 0) {
      delete otpStore[mobile];
      throw new Error('Too many incorrect attempts. Please request a new OTP.');
    }
    throw new Error(`Incorrect OTP. ${remaining} attempt(s) remaining.`);
  }

  // Success — clear store
  delete otpStore[mobile];
  return { success: true, message: 'OTP verified successfully' };
};

/**
 * Clear stored OTP for a number (e.g. on screen unmount).
 */
export const clearOTP = (phone) => {
  const mobile = normalisePhone(phone);
  delete otpStore[mobile];
};

export default { sendOTP, verifyOTP, clearOTP };
