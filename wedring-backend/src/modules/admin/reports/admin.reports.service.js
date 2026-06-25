/**
 * Wedring Backend — Admin Reports Service
 */
import { supabaseAdmin } from '../../../config/supabase.js';

export async function getUsersReport({ from, to, tier }) {
  let query = supabaseAdmin
    .from('users')
    .select(`
      id, email, mobile, profile_for, mother_tongue, membership_tier,
      profile_complete_pct, is_active, created_at,
      profiles (full_name, gender, dob, religion, caste, city, state)
    `)
    .order('created_at', { ascending: false });

  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to + 'T23:59:59.999Z');
  if (tier && tier !== 'all') query = query.eq('membership_tier', tier);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getMembershipsReport({ from, to, plan_id }) {
  let query = supabaseAdmin
    .from('user_memberships')
    .select(`
      *,
      user:user_id (email),
      plan:plan_id (name, price)
    `)
    .order('created_at', { ascending: false });

  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to + 'T23:59:59.999Z');
  if (plan_id) query = query.eq('plan_id', plan_id);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getPaymentsReport({ from, to, status }) {
  let query = supabaseAdmin
    .from('payments')
    .select(`
      *,
      user:user_id (email, mobile),
      plan:plan_id (name, price)
    `)
    .order('created_at', { ascending: false });

  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to + 'T23:59:59.999Z');
  if (status && status !== 'all') query = query.eq('payment_status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getPurchaseHistory({ userId, from, to }) {
  let query = supabaseAdmin
    .from('payments')
    .select(`
      *,
      plan:plan_id (name, price, validity_days)
    `)
    .order('created_at', { ascending: false });

  if (userId) query = query.eq('user_id', userId);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to + 'T23:59:59.999Z');

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export default { getUsersReport, getMembershipsReport, getPaymentsReport, getPurchaseHistory };
