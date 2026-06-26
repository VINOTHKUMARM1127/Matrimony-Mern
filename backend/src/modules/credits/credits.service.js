/**
 * Wedring Backend — Credits Service
 *
 * Handles atomic credit deduction for contact/horoscope views.
 */
import { supabaseAdmin } from '../../config/supabase.js';
import { sendPush } from '../notifications/notifications.service.js';
import logger from '../../utils/logger.js';

/**
 * Deduct a contact credit and return target's contact details
 */
export async function deductContactCredit(viewerId, targetUserId) {
  // Check if already viewed
  const { data: existing } = await supabaseAdmin
    .from('credit_transactions')
    .select('id')
    .eq('user_id', viewerId)
    .eq('target_user_id', targetUserId)
    .eq('type', 'contact_view')
    .maybeSingle();

  if (existing) {
    // Already viewed — return contact without charging
    return await getContactDetails(targetUserId);
  }

  // Get active membership
  const { data: membership } = await supabaseAdmin
    .from('user_memberships')
    .select('id, contact_credits_remaining')
    .eq('user_id', viewerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (!membership || membership.contact_credits_remaining <= 0) {
    const err = new Error('Insufficient contact credits');
    err.statusCode = 403;
    throw err;
  }

  // Atomic deduct: use .gt() to prevent race condition
  const { error: deductErr } = await supabaseAdmin
    .from('user_memberships')
    .update({
      contact_credits_remaining: membership.contact_credits_remaining - 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.id)
    .gt('contact_credits_remaining', 0);

  if (deductErr) throw deductErr;

  // Log transaction
  await supabaseAdmin.from('credit_transactions').insert({
    user_id: viewerId,
    type: 'contact_view',
    credits_deducted: 1,
    target_user_id: targetUserId,
  });

  // Low credit warning
  if (membership.contact_credits_remaining - 1 < 2) {
    sendPush(viewerId, {
      title: 'Low Credits ⚠️',
      body: `Only ${membership.contact_credits_remaining - 1} contact credits remaining.`,
      type: 'low_credits',
    }).catch(() => {});
  }

  return await getContactDetails(targetUserId);
}

/**
 * Deduct a horoscope view credit
 */
export async function deductHoroscopeCredit(viewerId, targetUserId) {
  // Check if already viewed
  const { data: existing } = await supabaseAdmin
    .from('credit_transactions')
    .select('id')
    .eq('user_id', viewerId)
    .eq('target_user_id', targetUserId)
    .eq('type', 'horoscope_view')
    .maybeSingle();

  if (existing) {
    return await getHoroscopeDetails(targetUserId);
  }

  // Get active membership
  const { data: membership } = await supabaseAdmin
    .from('user_memberships')
    .select('id, contact_credits_remaining')
    .eq('user_id', viewerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (!membership || membership.contact_credits_remaining <= 0) {
    const err = new Error('Insufficient credits');
    err.statusCode = 403;
    throw err;
  }

  // Atomic deduct
  const { error: deductErr } = await supabaseAdmin
    .from('user_memberships')
    .update({
      contact_credits_remaining: membership.contact_credits_remaining - 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.id)
    .gt('contact_credits_remaining', 0);

  if (deductErr) throw deductErr;

  // Log transaction
  await supabaseAdmin.from('credit_transactions').insert({
    user_id: viewerId,
    type: 'horoscope_view',
    credits_deducted: 1,
    target_user_id: targetUserId,
  });

  return await getHoroscopeDetails(targetUserId);
}

/**
 * Get credit balance
 */
export async function getBalance(userId) {
  const { data: membership } = await supabaseAdmin
    .from('user_memberships')
    .select('*, plan:plan_id (name)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (!membership) {
    return {
      contact_credits: 0,
      interest_credits: 0,
      plan: 'free',
      expiry: null,
    };
  }

  return {
    contact_credits: membership.contact_credits_remaining,
    interest_credits: membership.interest_credits_remaining,
    plan: membership.plan?.name || 'free',
    expiry: membership.expires_at,
  };
}

/**
 * Get credit transaction history
 */
export async function getTransactions(userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('credit_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { transactions: data || [], total: count || 0 };
}

/**
 * Helper: get contact details of target user
 */
async function getContactDetails(targetUserId) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('email, mobile')
    .eq('id', targetUserId)
    .single();

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, city, state')
    .eq('user_id', targetUserId)
    .single();

  return {
    contact: {
      email: data?.email,
      mobile: data?.mobile,
      name: profile?.full_name,
      city: profile?.city,
      state: profile?.state,
    },
  };
}

/**
 * Helper: get horoscope details
 */
async function getHoroscopeDetails(targetUserId) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('rasi, nakshatra, lagnam, gothram, dosham')
    .eq('user_id', targetUserId)
    .single();

  return { horoscope: data || {} };
}

export default { deductContactCredit, deductHoroscopeCredit, getBalance, getTransactions };
