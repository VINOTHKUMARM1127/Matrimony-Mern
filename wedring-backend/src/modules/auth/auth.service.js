/**
 * Wedring Backend — Auth Service
 *
 * Handles registration (3-step), login, logout, token refresh, OTP.
 * Uses Supabase Auth for all auth operations.
 */
import { supabaseAnon, supabaseAdmin } from '../../config/supabase.js';
import { sendPush } from '../notifications/notifications.service.js';
import logger from '../../utils/logger.js';

/**
 * Step 1: Validate registration data (stateless)
 * Data is returned to be passed forward in Step 2.
 */
export async function registerStep1({ profile_for, mother_tongue }) {
  // Validation already handled by Zod middleware
  return { profile_for, mother_tongue };
}

/**
 * Step 2: Check uniqueness and trigger Supabase Email OTP signup
 */
export async function registerStep2({ email, mobile, password, profile_for, mother_tongue }) {
  // Check email uniqueness
  const { data: existingEmail } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingEmail) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  // Check mobile uniqueness
  if (mobile) {
    const { data: existingMobile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('mobile', mobile)
      .maybeSingle();

    if (existingMobile) {
      const err = new Error('Mobile number already registered');
      err.statusCode = 409;
      throw err;
    }
  }

  // Create user in Supabase Auth with email OTP
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // Require OTP verification
    user_metadata: { profile_for, mother_tongue, mobile },
  });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  // Send OTP via Supabase
  const { error: otpError } = await supabaseAnon.auth.signInWithOtp({ email });

  if (otpError) {
    logger.warn('OTP send failed:', otpError.message);
  }

  return {
    message: 'OTP sent to email. Please verify to complete registration.',
    user_id: data.user.id,
  };
}

/**
 * Verify OTP → confirm user → create users table row → trigger initial distribution
 */
export async function verifyOtp({ email, otp }) {
  // Verify OTP via Supabase
  const { data, error } = await supabaseAnon.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  });

  if (error) {
    const err = new Error(error.message || 'Invalid OTP');
    err.statusCode = 400;
    throw err;
  }

  const user = data.user;
  const session = data.session;

  if (!user) {
    const err = new Error('OTP verification failed');
    err.statusCode = 400;
    throw err;
  }

  // Confirm email in auth
  await supabaseAdmin.auth.admin.updateUser(user.id, { email_confirm: true });

  // Create user record in users table
  const metadata = user.user_metadata || {};
  const { error: insertErr } = await supabaseAdmin.from('users').upsert({
    id: user.id,
    email: user.email,
    mobile: metadata.mobile || null,
    profile_for: metadata.profile_for || 'myself',
    mother_tongue: metadata.mother_tongue || null,
    membership_tier: 'free',
    profile_complete_pct: 0,
    is_active: true,
  }, { onConflict: 'id' });

  if (insertErr) {
    logger.error('Failed to create users record:', insertErr.message);
  }

  // Create empty profile record
  await supabaseAdmin.from('profiles').upsert({
    id: user.id,
    user_id: user.id,
  }, { onConflict: 'user_id' });

  // Trigger initial distribution for free tier (async, don't block)
  triggerInitialDistribution(user.id, 'free').catch(err => {
    logger.warn('Initial distribution failed:', err.message);
  });

  // Send welcome push notification (async)
  sendPush(user.id, {
    title: 'Welcome to Wedring! 💍',
    body: 'Complete your profile to start finding your perfect match.',
    type: 'welcome',
  }).catch(() => {});

  return {
    access_token: session?.access_token,
    refresh_token: session?.refresh_token,
    user: {
      id: user.id,
      email: user.email,
      mobile: metadata.mobile,
      profile_for: metadata.profile_for,
    },
  };
}

/**
 * Login with email + password
 */
export async function loginWithEmail({ email, password }) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

  if (error) {
    const err = new Error(error.message || 'Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  // Fetch user details from users table
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      ...userData,
    },
  };
}

/**
 * Login with mobile + password
 */
export async function loginWithMobile({ mobile, password }) {
  // Lookup email by mobile
  const { data: userData, error: lookupErr } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('mobile', mobile)
    .single();

  if (lookupErr || !userData) {
    const err = new Error('No account found with this mobile number');
    err.statusCode = 404;
    throw err;
  }

  // Sign in with the email
  return loginWithEmail({ email: userData.email, password });
}

/**
 * Logout
 */
export async function logout(token) {
  const { error } = await supabaseAnon.auth.signOut();
  if (error) logger.warn('Logout error:', error.message);
  return true;
}

/**
 * Refresh session
 */
export async function refreshToken({ refresh_token }) {
  const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token });

  if (error) {
    const err = new Error(error.message || 'Failed to refresh token');
    err.statusCode = 401;
    throw err;
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
}

/**
 * Resend OTP
 */
export async function resendOtp({ email }) {
  const { error } = await supabaseAnon.auth.resend({ type: 'signup', email });

  if (error) {
    const err = new Error(error.message || 'Failed to resend OTP');
    err.statusCode = 400;
    throw err;
  }

  return { message: 'OTP resent successfully' };
}

/**
 * Trigger initial distribution (internal helper)
 */
async function triggerInitialDistribution(userId, tier) {
  // Dynamic import to avoid circular dependency
  const { runInitialDistribution } = await import('../distribution/distribution.service.js');
  await runInitialDistribution(userId, tier);
}

export default {
  registerStep1, registerStep2, verifyOtp,
  loginWithEmail, loginWithMobile, logout,
  refreshToken, resendOtp,
};
