/**
 * Wedring Backend — Interests Service
 */
import { supabaseAdmin } from '../../config/supabase.js';
import { sendPush } from '../notifications/notifications.service.js';
import logger from '../../utils/logger.js';

/**
 * Send interest to a target user
 */
export async function sendInterest(senderId, targetUserId) {
  // Check for duplicate
  const { data: existing } = await supabaseAdmin
    .from('interests')
    .select('id, status')
    .eq('sender_id', senderId)
    .eq('receiver_id', targetUserId)
    .maybeSingle();

  if (existing) {
    const err = new Error('Interest already sent to this user');
    err.statusCode = 409;
    throw err;
  }

  // Check interest credits
  const { data: membership } = await supabaseAdmin
    .from('user_memberships')
    .select('id, interest_credits_remaining')
    .eq('user_id', senderId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (!membership || membership.interest_credits_remaining <= 0) {
    const err = new Error('Insufficient interest credits');
    err.statusCode = 403;
    throw err;
  }

  // Deduct 1 interest credit atomically
  const { error: deductErr } = await supabaseAdmin
    .from('user_memberships')
    .update({
      interest_credits_remaining: membership.interest_credits_remaining - 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.id)
    .gt('interest_credits_remaining', 0);

  if (deductErr) throw deductErr;

  // Insert interest record
  const { data, error } = await supabaseAdmin
    .from('interests')
    .insert({
      sender_id: senderId,
      receiver_id: targetUserId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;

  // Log credit transaction
  await supabaseAdmin.from('credit_transactions').insert({
    user_id: senderId,
    type: 'interest_sent',
    credits_deducted: 1,
    target_user_id: targetUserId,
  });

  // Send FCM push to receiver
  sendPush(targetUserId, {
    title: 'New Interest! 💕',
    body: 'Someone has expressed interest in your profile.',
    type: 'interest_received',
    data: { sender_id: senderId },
  }).catch(() => {});

  // Low credits warning
  if (membership.interest_credits_remaining - 1 < 2) {
    sendPush(senderId, {
      title: 'Low Credits ⚠️',
      body: `Only ${membership.interest_credits_remaining - 1} interest credits remaining.`,
      type: 'low_credits',
    }).catch(() => {});
  }

  return data;
}

/**
 * Get sent interests
 */
export async function getSentInterests(userId) {
  const { data, error } = await supabaseAdmin
    .from('interests')
    .select(`
      *,
      receiver:receiver_id (
        full_name, gender, dob, city, highest_qualification, occupation
      )
    `)
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Attach photos
  const receiverIds = (data || []).map(d => d.receiver_id);
  const photos = await fetchPhotos(receiverIds);

  return (data || []).map(item => ({
    ...item,
    receiver_photos: photos[item.receiver_id] || [],
  }));
}

/**
 * Get received interests
 */
export async function getReceivedInterests(userId) {
  const { data, error } = await supabaseAdmin
    .from('interests')
    .select(`
      *,
      sender:sender_id (
        full_name, gender, dob, city, highest_qualification, occupation
      )
    `)
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const senderIds = (data || []).map(d => d.sender_id);
  const photos = await fetchPhotos(senderIds);

  return (data || []).map(item => ({
    ...item,
    sender_photos: photos[item.sender_id] || [],
  }));
}

/**
 * Accept interest
 */
export async function acceptInterest(interestId, userId) {
  const { data, error } = await supabaseAdmin
    .from('interests')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', interestId)
    .eq('receiver_id', userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    const err = new Error('Interest not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  // Notify sender
  sendPush(data.sender_id, {
    title: 'Interest Accepted! 🎉',
    body: 'Your interest has been accepted.',
    type: 'interest_accepted',
    data: { interest_id: interestId },
  }).catch(() => {});

  return data;
}

/**
 * Reject interest
 */
export async function rejectInterest(interestId, userId) {
  const { data, error } = await supabaseAdmin
    .from('interests')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', interestId)
    .eq('receiver_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark user as not interested
 */
export async function markNotInterested(userId, targetUserId) {
  // Insert into not_interested
  const { data, error } = await supabaseAdmin
    .from('not_interested')
    .upsert({
      user_id: userId,
      target_user_id: targetUserId,
    }, { onConflict: 'user_id,target_user_id' })
    .select()
    .single();

  if (error) throw error;

  // Remove from distributed profiles if present
  await supabaseAdmin
    .from('user_distributed_profiles')
    .delete()
    .eq('user_id', userId)
    .eq('profile_id', targetUserId);

  return data;
}

/**
 * Get not-interested profiles
 */
export async function getNotInterested(userId) {
  const { data, error } = await supabaseAdmin
    .from('not_interested')
    .select(`
      *,
      target:target_user_id (
        full_name, gender, dob, city, highest_qualification, occupation
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Remove not-interested (restore)
 */
export async function removeNotInterested(userId, targetUserId) {
  const { error } = await supabaseAdmin
    .from('not_interested')
    .delete()
    .eq('user_id', userId)
    .eq('target_user_id', targetUserId);

  if (error) throw error;
  return true;
}

/**
 * Check interest status
 */
export async function checkStatus(senderId, receiverId) {
  const { data, error } = await supabaseAdmin
    .from('interests')
    .select('id, status')
    .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
    .maybeSingle();

  if (error) return null;
  return data;
}

/**
 * Helper: fetch photos for a list of user IDs
 */
async function fetchPhotos(userIds) {
  if (!userIds || userIds.length === 0) return {};

  const { data: photos } = await supabaseAdmin
    .from('profile_photos')
    .select('user_id, id, r2_url, is_primary')
    .in('user_id', userIds);

  const map = {};
  (photos || []).forEach(p => {
    if (!map[p.user_id]) map[p.user_id] = [];
    map[p.user_id].push(p);
  });
  return map;
}

export default {
  sendInterest, getSentInterests, getReceivedInterests,
  acceptInterest, rejectInterest,
  markNotInterested, getNotInterested, removeNotInterested, checkStatus,
};
