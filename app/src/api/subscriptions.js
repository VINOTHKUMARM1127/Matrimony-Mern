/**
 * Wedring Matrimony — Subscriptions API
 * Premium membership management
 */
import apiClient from './apiClient';

/**
 * Get user's active subscription
 */
export const getActiveSubscription = async (userId) => {
  try {
    const data = await apiClient.get('/membership/my-plan');
    return data;
  } catch (err) {
    return null;
  }
};

/**
 * Get subscription history
 */
export const getSubscriptionHistory = async (userId) => {
  try {
    const data = await apiClient.get('/membership/history');
    return data;
  } catch (err) {
    return [];
  }
};

/**
 * Create subscription record after payment
 */
export const createSubscription = async (subscriptionData) => {
  // Frontend might pass plan_type, backend purchase schema expects plan_id
  // If plan_id is not provided, we might need to fetch plans to get the ID, 
  // or adjust backend to accept plan_name. Let's assume we pass plan_id.
  
  // We first fetch plans to map the type to ID if needed
  let planId = subscriptionData.plan_id;
  if (!planId && subscriptionData.plan_type) {
    const plans = await apiClient.get('/membership/plans');
    const plan = plans.find(p => p.name === subscriptionData.plan_type);
    if (plan) planId = plan.id;
  }

  const data = await apiClient.post('/membership/purchase', {
    plan_id: planId,
    payment_ref: subscriptionData.razorpay_payment_id || null,
    gateway: subscriptionData.razorpay_payment_id ? 'razorpay' : 'manual'
  });

  return data;
};

/**
 * Check if user has premium feature access.
 */
export const checkPremiumAccess = async (userId, feature) => {
  const sub = await getActiveSubscription(userId);
  if (!sub) return false;

  // Assume tier info is populated or we extract it from plan name
  const tier = sub.plan?.name || sub.tier || 'free';

  const featureMap = {
    silver: ['view_contacts', 'limited_messages', 'profile_visitors'],
    gold: ['view_contacts', 'unlimited_messages', 'horoscope_unlock', 'priority_visibility', 'advanced_search', 'profile_visitors'],
    platinum: ['view_contacts', 'unlimited_messages', 'horoscope_unlock', 'priority_visibility', 'advanced_search', 'profile_visitors', 'boosted_profile', 'verified_access', 'relationship_manager'],
  };

  const planFeatures = featureMap[tier] || [];
  return planFeatures.includes(feature);
};
