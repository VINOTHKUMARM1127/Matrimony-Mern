/**
 * Wedring Backend — Auth Routes
 */
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import auth from '../../middleware/auth.js';
import { authLimiter, otpLimiter } from '../../middleware/rateLimit.js';
import * as authController from './auth.controller.js';

const router = Router();

// Validation schemas
const step1Schema = z.object({
  profile_for: z.enum(['myself', 'son', 'daughter', 'brother', 'sister', 'friend', 'relative']),
  mother_tongue: z.string().min(1, 'Mother tongue is required'),
});

const step2Schema = z.object({
  email: z.string().email('Valid email is required'),
  mobile: z.string().min(10, 'Valid mobile number is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  profile_for: z.string().min(1),
  mother_tongue: z.string().min(1),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4, 'OTP is required'),
});

const loginEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const loginMobileSchema = z.object({
  mobile: z.string().min(10),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

const resendOtpSchema = z.object({
  email: z.string().email(),
});

// Routes
router.post('/register/step1', authLimiter, validate(step1Schema), authController.registerStep1);
router.post('/register/step2', authLimiter, validate(step2Schema), authController.registerStep2);
router.post('/register/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/login/email', authLimiter, validate(loginEmailSchema), authController.loginEmail);
router.post('/login/mobile', authLimiter, validate(loginMobileSchema), authController.loginMobile);
router.post('/login/mobile-trusted', authLimiter, authController.loginMobileTrusted);
router.post('/logout', auth, authController.logout);
router.post('/refresh-token', validate(refreshSchema), authController.refreshToken);
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), authController.resendOtp);

export default router;
