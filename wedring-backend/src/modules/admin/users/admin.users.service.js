/**
 * Wedring Backend — Admin Users Service
 */
import { supabaseAdmin } from '../../../config/supabase.js';
import logger from '../../../utils/logger.js';

/**
 * Get dashboard stats
 */
export async function getDashboardStats() {
  const [
    { count: totalUsers },
    { count: premiumUsers },
    { data: todayPayments },
    { data: monthPayments },
    { count: activePlans },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).neq('membership_tier', 'free'),
    supabaseAdmin.from('payments').select('amount').eq('payment_status', 'verified')
      .gte('created_at', new Date().toISOString().split('T')[0]),
    supabaseAdmin.from('payments').select('amount').eq('payment_status', 'verified')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabaseAdmin.from('user_memberships').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  const revenueToday = (todayPayments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const revenueMonth = (monthPayments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return {
    total_users: totalUsers || 0,
    premium_users: premiumUsers || 0,
    revenue_today: revenueToday,
    revenue_month: revenueMonth,
    active_plans: activePlans || 0,
  };
}

/**
 * List users with pagination and filters
 */
export async function listUsers({ page = 1, limit = 20, tier, search }) {
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('users')
    .select(`
      *,
      profiles!inner (full_name, gender, dob, city, state, religion),
      profile_photos (id, r2_url, is_primary),
      user_memberships (id, status, plan_id, expires_at, contact_credits_remaining, interest_credits_remaining)
    `, { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (tier && tier !== 'all') {
    query = query.eq('membership_tier', tier);
  }

  if (search) {
    query = query.or(`email.ilike.%${search}%,mobile.ilike.%${search}%,profiles.full_name.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { users: data || [], total: count || 0 };
}

/**
 * Get user by ID with full details
 */
export async function getUserById(userId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      profiles (*),
      profile_photos (*),
      partner_preferences (*),
      user_memberships (*, plan:plan_id (*))
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user details
 */
export async function updateUser(userId, updates) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Soft delete user
 */
export async function deleteUser(userId) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
  return true;
}

/**
 * Hard delete user (auth and db)
 */
export async function hardDeleteUser(userId) {
  // Try to use GoTrue Admin API to delete the auth user
  // (which cascades to users and profiles via foreign keys if set up, 
  // but let's be explicit just in case)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    logger.warn(`Failed to delete auth user ${userId}:`, error.message);
    // Explicitly delete from users table as fallback
    await supabaseAdmin.from('users').delete().eq('id', userId);
  }
  return true;
}

/**
 * Cleanup incomplete users
 */
export async function cleanupIncomplete() {
  // Find all users with profile_complete_pct = 0
  const { data: incompleteUsers, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('profile_complete_pct', 0);
  
  if (error) throw error;
  if (!incompleteUsers || incompleteUsers.length === 0) return 0;

  let deletedCount = 0;
  for (const user of incompleteUsers) {
    try {
      await hardDeleteUser(user.id);
      deletedCount++;
    } catch (err) {
      logger.warn(`Failed to cleanup user ${user.id}:`, err.message);
    }
  }

  return deletedCount;
}

export async function addPhoto(userId, publicUrl) {
  const { data, error } = await supabaseAdmin
    .from('profile_photos')
    .insert({
      user_id: userId,
      r2_url: publicUrl,
      is_primary: true,
      display_order: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upgrade user's membership
 */
export async function upgradeUser(userId, planId) {
  const { upgradePlan } = await import('../../membership/membership.service.js');
  return await upgradePlan(userId, planId);
}

/**
 * Downgrade user to free tier
 */
export async function downgradeUser(userId) {
  // Expire all active memberships
  await supabaseAdmin
    .from('user_memberships')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .in('status', ['active', 'queued']);

  // Set user to free tier
  await supabaseAdmin
    .from('users')
    .update({ membership_tier: 'free', updated_at: new Date().toISOString() })
    .eq('id', userId);

  return true;
}

/**
 * Reset user profile data (keep auth)
 */
export async function resetUser(userId) {
  await supabaseAdmin
    .from('profiles')
    .update({
      full_name: null, gender: null, dob: null, height_cm: null,
      marital_status: null, religion: null, caste: null,
      highest_qualification: null, occupation: null, annual_income: null,
      state: null, district: null, city: null, about_me: null,
      rasi: null, nakshatra: null, lagnam: null, gothram: null, dosham: null,
      languages_known: null, hobbies: null, interests: null, lifestyle_prefs: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  await supabaseAdmin
    .from('users')
    .update({ profile_complete_pct: 0, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return true;
}

export default {
  getDashboardStats, listUsers, getUserById,
  updateUser, deleteUser, hardDeleteUser, cleanupIncomplete, addPhoto,
  upgradeUser, downgradeUser, resetUser,
};
