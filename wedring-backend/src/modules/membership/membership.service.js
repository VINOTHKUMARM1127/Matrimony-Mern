/**
 * Wedring Backend — Membership Service
 */
import { supabaseAdmin } from '../../config/supabase.js';
import { sendPush } from '../notifications/notifications.service.js';
import logger from '../../utils/logger.js';

/**
 * List all active membership plans
 */
export async function getPlans() {
  const { data, error } = await supabaseAdmin
    .from('membership_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get user's active membership + queued plans + credits
 */
export async function getMyPlan(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_memberships')
    .select('*, plan:plan_id (name, price, validity_days, contact_credits, interest_credits)')
    .eq('user_id', userId)
    .in('status', ['active', 'queued'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  const active = (data || []).find(m => m.status === 'active');
  const queued = (data || []).filter(m => m.status === 'queued');

  return {
    active: active || null,
    queued,
    credits: active ? {
      contact_credits_remaining: active.contact_credits_remaining,
      interest_credits_remaining: active.interest_credits_remaining,
      expires_at: active.expires_at,
    } : null,
  };
}

/**
 * Purchase a plan (create payment record)
 */
export async function purchase(userId, { plan_id, payment_ref, gateway }) {
  // Validate plan exists
  const { data: plan, error: planErr } = await supabaseAdmin
    .from('membership_plans')
    .select('*')
    .eq('id', plan_id)
    .eq('is_active', true)
    .single();

  if (planErr || !plan) {
    const err = new Error('Plan not found or inactive');
    err.statusCode = 404;
    throw err;
  }

  // Create payment record
  const { data: payment, error: payErr } = await supabaseAdmin
    .from('payments')
    .insert({
      user_id: userId,
      plan_id,
      amount: plan.price,
      currency: 'INR',
      payment_status: 'pending',
      payment_gateway: gateway || 'manual',
      transaction_ref: payment_ref || null,
    })
    .select()
    .single();

  if (payErr) throw payErr;

  return { payment_id: payment.id, status: 'pending', message: 'Payment submitted for admin verification' };
}

/**
 * Get membership history
 */
export async function getHistory(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_memberships')
    .select('*, plan:plan_id (name, price, validity_days)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Renew plan (same plan, extend expiry and add credits)
 */
export async function renewPlan(userId, planId) {
  const { data: activeMembership } = await supabaseAdmin
    .from('user_memberships')
    .select('*, plan:plan_id (*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .eq('plan_id', planId)
    .maybeSingle();

  if (!activeMembership) {
    const err = new Error('No active membership with this plan');
    err.statusCode = 404;
    throw err;
  }

  const plan = activeMembership.plan;
  const newExpiry = new Date(activeMembership.expires_at);
  newExpiry.setDate(newExpiry.getDate() + plan.validity_days);

  const { data, error } = await supabaseAdmin
    .from('user_memberships')
    .update({
      expires_at: newExpiry.toISOString(),
      contact_credits_remaining: activeMembership.contact_credits_remaining + plan.contact_credits,
      interest_credits_remaining: activeMembership.interest_credits_remaining + plan.interest_credits,
      updated_at: new Date().toISOString(),
    })
    .eq('id', activeMembership.id)
    .select()
    .single();

  if (error) throw error;

  sendPush(userId, {
    title: 'Plan Renewed! ✨',
    body: `Your ${plan.name} plan has been renewed.`,
    type: 'plan_renewed',
  }).catch(() => {});

  return data;
}

/**
 * Upgrade plan (activate new, queue old)
 */
export async function upgradePlan(userId, newPlanId) {
  // Get new plan details
  const { data: newPlan } = await supabaseAdmin
    .from('membership_plans')
    .select('*')
    .eq('id', newPlanId)
    .single();

  if (!newPlan) {
    const err = new Error('Plan not found');
    err.statusCode = 404;
    throw err;
  }

  // Get current active membership
  const { data: currentMembership } = await supabaseAdmin
    .from('user_memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  // If there's an active plan, queue it
  if (currentMembership) {
    await supabaseAdmin
      .from('user_memberships')
      .update({ status: 'queued', updated_at: new Date().toISOString() })
      .eq('id', currentMembership.id);
  }

  // Create new active membership
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + newPlan.validity_days);

  const { data: newMembership, error } = await supabaseAdmin
    .from('user_memberships')
    .insert({
      user_id: userId,
      plan_id: newPlanId,
      status: 'active',
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      contact_credits_remaining: newPlan.contact_credits,
      interest_credits_remaining: newPlan.interest_credits,
    })
    .select()
    .single();

  if (error) throw error;

  // Update user tier
  await supabaseAdmin
    .from('users')
    .update({ membership_tier: newPlan.name, updated_at: new Date().toISOString() })
    .eq('id', userId);

  // Trigger upgrade distribution
  try {
    const { runInitialDistribution } = await import('../distribution/distribution.service.js');
    await runInitialDistribution(userId, newPlan.name);
  } catch (err) {
    logger.warn('Upgrade distribution failed:', err.message);
  }

  sendPush(userId, {
    title: 'Plan Upgraded! 🎉',
    body: `Your plan has been upgraded to ${newPlan.name}.`,
    type: 'plan_upgraded',
  }).catch(() => {});

  return newMembership;
}

/**
 * Check and handle expired memberships (called by cron)
 */
export async function checkExpiredMemberships() {
  const now = new Date().toISOString();

  // Find expired active memberships
  const { data: expired, error } = await supabaseAdmin
    .from('user_memberships')
    .select('*, user:user_id (id, email)')
    .eq('status', 'active')
    .lt('expires_at', now);

  if (error) {
    logger.error('Failed to check expired memberships:', error.message);
    return;
  }

  for (const membership of (expired || [])) {
    try {
      // Mark as expired
      await supabaseAdmin
        .from('user_memberships')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', membership.id);

      // Check for queued plan
      const { data: queued } = await supabaseAdmin
        .from('user_memberships')
        .select('*, plan:plan_id (*)')
        .eq('user_id', membership.user_id)
        .eq('status', 'queued')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (queued) {
        // Activate queued plan
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + queued.plan.validity_days);

        await supabaseAdmin
          .from('user_memberships')
          .update({
            status: 'active',
            starts_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', queued.id);

        await supabaseAdmin
          .from('users')
          .update({ membership_tier: queued.plan.name })
          .eq('id', membership.user_id);

        // Trigger distribution for new tier
        try {
          const { runInitialDistribution } = await import('../distribution/distribution.service.js');
          await runInitialDistribution(membership.user_id, queued.plan.name);
        } catch (err) {
          logger.warn('Queued plan distribution failed:', err.message);
        }

        sendPush(membership.user_id, {
          title: 'New Plan Activated! ✨',
          body: `Your ${queued.plan.name} plan is now active.`,
          type: 'plan_activated',
        }).catch(() => {});
      } else {
        // Downgrade to free
        await supabaseAdmin
          .from('users')
          .update({ membership_tier: 'free', updated_at: new Date().toISOString() })
          .eq('id', membership.user_id);

        sendPush(membership.user_id, {
          title: 'Plan Expired',
          body: 'Your plan has expired. Upgrade to continue premium features.',
          type: 'plan_expired',
        }).catch(() => {});
      }

      logger.info(`Processed expired membership for user ${membership.user_id}`);
    } catch (err) {
      logger.error(`Failed to process expired membership ${membership.id}:`, err.message);
    }
  }

  return { processed: (expired || []).length };
}

export default {
  getPlans, getMyPlan, purchase, getHistory,
  renewPlan, upgradePlan, checkExpiredMemberships,
};
