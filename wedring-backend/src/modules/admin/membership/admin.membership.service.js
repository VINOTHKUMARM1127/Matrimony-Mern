/**
 * Wedring Backend — Admin Membership Service
 */
import { supabaseAdmin } from '../../../config/supabase.js';

export async function listPlans() {
  const { data, error } = await supabaseAdmin
    .from('membership_plans')
    .select('*')
    .order('price', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createPlan({ name, price, validity_days, contact_credits, interest_credits }) {
  const { data, error } = await supabaseAdmin
    .from('membership_plans')
    .insert({ name, price, validity_days, contact_credits, interest_credits, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlan(planId, updates) {
  const { data, error } = await supabaseAdmin
    .from('membership_plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', planId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePlan(planId) {
  const { error } = await supabaseAdmin
    .from('membership_plans')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', planId);
  if (error) throw error;
  return true;
}

export default { listPlans, createPlan, updatePlan, deletePlan };
