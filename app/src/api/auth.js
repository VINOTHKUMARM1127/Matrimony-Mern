/**
 * Wedring Matrimony — Auth API
 * Authentication functions using the Node backend API
 */
import apiClient from './apiClient';

/**
 * Sign up with email/phone and password
 */
export const signUpWithPassword = async (identifier, password, metadata = {}) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const payload = {
    password,
    full_name: metadata.name,
    profile_for: metadata.profileFor || 'Self',
  };
  
  if (isEmail) {
    payload.email = identifier;
  } else {
    payload.mobile = identifier;
  }
  
  const data = await apiClient.post('/auth/register/step1', payload);
  return data;
};

/**
 * Sign in with email and password
 */
export const signInWithPassword = async (identifier, password) => {
  // Our backend explicitly supports login/email. If phone/password is needed we'd need to adjust the backend.
  // Assuming email for password login based on standard flow
  return await apiClient.post('/auth/login/email', { email: identifier, password });
};

/**
 * Sign in with phone number (sends OTP)
 */
export const signInWithPhone = async (phone) => {
  return await apiClient.post('/auth/login/phone', { mobile: phone });
};

/**
 * Sign in with email address (sends OTP)
 */
export const signInWithEmailOtp = async (email) => {
  // Not implemented on backend currently, placeholder for future
  throw new Error('Email OTP login not supported on backend yet');
};

/**
 * Verify OTP code for phone
 */
export const verifyOTP = async (phone, token) => {
  return await apiClient.post('/auth/login/verify-phone', { mobile: phone, token });
};

/**
 * Verify OTP code for email
 */
export const verifyEmailOTP = async (email, token) => {
  throw new Error('Email OTP login not supported on backend yet');
};

/**
 * Verify OTP code for email signup confirmation
 */
export const verifySignupOTP = async (identifier, token) => {
  return await apiClient.post('/auth/register/step2', { identifier, token });
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  return await apiClient.post('/auth/logout');
};

/**
 * Get current session / user (Validates token and returns profile info)
 */
export const getSession = async () => {
  try {
    const data = await apiClient.get('/profile');
    return { user: data.user || data };
  } catch (err) {
    return null;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const session = await getSession();
  return session ? session.user : null;
};

/**
 * Reset password via email
 */
export const resetPassword = async (email) => {
  throw new Error('Reset password not implemented on backend yet');
};

/**
 * Check if a user exists in auth.users by email or phone
 */
export const checkUserExists = async (email, phone) => {
  try {
    // If we have an endpoint for this, we could call it. 
    // Since we don't, we can just return false and let register/step1 fail if they exist.
    return false;
  } catch (error) {
    return false;
  }
};
