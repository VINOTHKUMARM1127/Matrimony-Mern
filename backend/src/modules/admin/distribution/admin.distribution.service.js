/**
 * Wedring Backend — Admin Distribution Service
 */
import { supabaseAdmin } from '../../../config/supabase.js';
import { manualDistribution } from '../../distribution/distribution.service.js';

export async function getDistributionConfig() {
  const { data, error } = await supabaseAdmin
    .from('distribution_config')
    .select('*')
    .order('tier', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateDistributionConfig(tier, updates) {
  const { data, error } = await supabaseAdmin
    .from('distribution_config')
    .upsert({ tier, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'tier' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function triggerManualDistribution(params) {
  return await manualDistribution(params);
}

export async function getDistributionLogs(page = 1, limit = 50, filters = {}) {
  const offset = (page - 1) * limit;
  let query = supabaseAdmin
    .from('distribution_logs')
    .select('*, user:user_id(id, full_name, email)', { count: 'exact' });

  if (filters.tier) query = query.eq('tier', filters.tier);
  if (filters.type) query = query.eq('distribution_type', filters.type);

  const { data, count, error } = await query
    .order('distributed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { logs: data || [], total: count || 0 };
}

export async function getDistributionHealth() {
  const [
    { count: totalDistributed },
    { count: premiumUsers },
    { count: activeUsers }
  ] = await Promise.all([
    supabaseAdmin.from('user_distributed_profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).neq('membership_tier', 'free').eq('is_active', true),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true)
  ]);

  return {
    totalDistributed: totalDistributed || 0,
    premiumUsers: premiumUsers || 0,
    activeUsers: activeUsers || 0
  };
}

export default { getDistributionConfig, updateDistributionConfig, triggerManualDistribution, getDistributionLogs, getDistributionHealth };
