/**
 * Wedring Backend — Auth Controller
 */
import * as authService from './auth.service.js';
import { success, error } from '../../utils/response.js';

export async function registerStep1(req, res, next) {
  try {
    const result = await authService.registerStep1(req.body);
    return success(res, result, 'Step 1 complete', 200);
  } catch (err) {
    next(err);
  }
}

export async function registerStep2(req, res, next) {
  try {
    const result = await authService.registerStep2(req.body);
    return success(res, result, 'OTP sent', 201);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const result = await authService.verifyOtp(req.body);
    return success(res, result, 'Registration complete', 201);
  } catch (err) {
    next(err);
  }
}

export async function loginEmail(req, res, next) {
  try {
    const result = await authService.loginWithEmail(req.body);
    return success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function loginMobile(req, res, next) {
  try {
    const result = await authService.loginWithMobile(req.body);
    return success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function loginMobileTrusted(req, res, next) {
  try {
    const result = await authService.loginWithMobileTrusted(req.body);
    return success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.token);
    return success(res, null, 'Logged out');
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const result = await authService.refreshToken(req.body);
    return success(res, result, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(req, res, next) {
  try {
    const result = await authService.resendOtp(req.body);
    return success(res, result, 'OTP resent');
  } catch (err) {
    next(err);
  }
}

export default {
  registerStep1, registerStep2, verifyOtp,
  loginEmail, loginMobile, loginMobileTrusted, logout,
  refreshToken, resendOtp,
};
