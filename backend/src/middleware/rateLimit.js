/**
 * Wedring Backend — Rate Limiting
 *
 * Configurable rate limiters for different route groups.
 */
import rateLimit from 'express-rate-limit';

/** General API: 100 requests per 15 min per IP */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

/** Auth routes: 20 requests per 15 min per IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

/** OTP resend: 1 request per 60 seconds per IP */
export const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Please wait 60 seconds before requesting a new OTP.' },
});

/** Upload routes: 10 requests per 15 min per IP */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many uploads, please try again later.' },
});

export default { generalLimiter, authLimiter, otpLimiter, uploadLimiter };
