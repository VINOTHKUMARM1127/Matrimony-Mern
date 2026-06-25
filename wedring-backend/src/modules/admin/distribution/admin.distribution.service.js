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

export default { getDistributionConfig, updateDistributionConfig, triggerManualDistribution };
