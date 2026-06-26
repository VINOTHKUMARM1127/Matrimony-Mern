/**
 * Wedring Backend — Admin Membership Service
 */
import { supabaseAdmin } from '../../../config/supabase.js';

export async function listPlans() {
  const { data, error } = await supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .order('price_inr', { ascending: true });
  if (error) throw error;
  
  return (data || []).map(p => ({
    ...p,
    id: p.tier,
    name: p.tier,
    price: p.price_inr,
    validity_days: (p.duration_months || 0) * 30,
    contact_credits: p.contacts_limit,
    interest_credits: p.interests_limit
  }));
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
  const mappedUpdates = { ...updates };
  
  if (updates.price !== undefined) { mappedUpdates.price_inr = updates.price; delete mappedUpdates.price; }
  if (updates.validity_days !== undefined) { mappedUpdates.duration_months = Math.round(updates.validity_days / 30); delete mappedUpdates.validity_days; }
  if (updates.contact_credits !== undefined) { mappedUpdates.contacts_limit = updates.contact_credits; delete mappedUpdates.contact_credits; }
  if (updates.interest_credits !== undefined) { mappedUpdates.interests_limit = updates.interest_credits; delete mappedUpdates.interest_credits; }

  const { data, error } = await supabaseAdmin
    .from('subscription_plans')
    .update({ ...mappedUpdates, updated_at: new Date().toISOString() })
    .eq('tier', planId)
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
