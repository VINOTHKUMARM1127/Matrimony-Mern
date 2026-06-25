/**
 * Wedring Backend — Admin Payments Service
 */
import { supabaseAdmin } from '../../../config/supabase.js';
import { upgradePlan } from '../../membership/membership.service.js';
import { sendPush } from '../../notifications/notifications.service.js';
import logger from '../../../utils/logger.js';

export async function listPayments({ page = 1, limit = 20, status }) {
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('payments')
    .select(`
      *,
      user:user_id (email, mobile),
      plan:plan_id (name, price)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('payment_status', status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { payments: data || [], total: count || 0 };
}

export async function verifyPayment(paymentId, adminUserId) {
  // Get payment details
  const { data: payment, error: fetchErr } = await supabaseAdmin
    .from('payments')
    .select('*, plan:plan_id (*)')
    .eq('id', paymentId)
    .single();

  if (fetchErr || !payment) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }

  // Update payment status
  const { error: updateErr } = await supabaseAdmin
    .from('payments')
    .update({
      payment_status: 'verified',
      verified_by: adminUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (updateErr) throw updateErr;

  // Activate membership
  try {
    await upgradePlan(payment.user_id, payment.plan_id);
  } catch (err) {
    logger.error('Failed to activate membership after payment verification:', err.message);
  }

  // Notify user
  sendPush(payment.user_id, {
    title: 'Payment Verified! ✅',
    body: `Your ${payment.plan?.name || ''} plan is now active.`,
    type: 'payment_verified',
  }).catch(() => {});

  return { verified: true };
}

export async function rejectPayment(paymentId, reason) {
  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('user_id')
    .eq('id', paymentId)
    .single();

  const { error } = await supabaseAdmin
    .from('payments')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (error) throw error;

  if (payment) {
    sendPush(payment.user_id, {
      title: 'Payment Rejected',
      body: reason || 'Your payment could not be verified. Please contact support.',
      type: 'payment_rejected',
    }).catch(() => {});
  }

  return { rejected: true };
}

export default { listPayments, verifyPayment, rejectPayment };
