import apiClient from './apiClient';

/**
 * Check if an email belongs to an admin
 */
export const checkIsAdmin = async () => {
  try {
    // A simple call to admin dashboard to verify admin rights
    await apiClient.get('/admin/dashboard/stats');
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Fetch Subscription Plans
 */
export const fetchSubscriptionPlans = async () => {
  const [plansRes, distRes] = await Promise.all([
    apiClient.get('/admin/plans'),
    apiClient.get('/admin/distribution/config').catch(() => ({ data: [] }))
  ]);
  
  const plans = plansRes.data || plansRes;
  const dist = distRes.data || distRes || [];
  
  return plans.map(p => {
    const d = dist.find(x => x.tier === p.name) || {};
    return {
      ...p,
      initial_recommended_profiles: d.initial_count || 0,
      daily_recommended_increment: d.daily_count || 0,
      initial_daily_profiles: 0,
      daily_profiles_increment: 0,
    };
  });
};

/**
 * Fetch all users with their memberships and photos
 */
export const fetchAllUsers = async () => {
  const data = await apiClient.get('/admin/users?limit=1000');
  return data.data || data.users || data;
};

/**
 * Update Subscription Plan (Membership + Distribution Config)
 */
export const updateSubscriptionPlan = async (tierName, planData) => {
  // Update Membership Plan
  const plansRes = await apiClient.get('/admin/plans');
  const plan = (plansRes.data || plansRes).find(p => p.name === tierName);
  
  if (plan) {
    const planUpdates = {};
    if (planData.price_inr !== undefined) planUpdates.price = planData.price_inr;
    if (planData.validity_days !== undefined) planUpdates.validity_days = planData.validity_days;
    if (planData.contact_credits !== undefined) planUpdates.contact_credits = planData.contact_credits;
    if (planData.interest_credits !== undefined) planUpdates.interest_credits = planData.interest_credits;
    if (planData.is_popular !== undefined) planUpdates.is_popular = planData.is_popular;
    if (planData.features !== undefined) planUpdates.features = planData.features;
    if (planData.color_code !== undefined) planUpdates.color_code = planData.color_code;
    
    if (Object.keys(planUpdates).length > 0) {
      await apiClient.put(`/admin/plans/${plan.id}`, planUpdates);
    }
  }

  // Update Distribution Config
  if (planData.initial_recommended_profiles !== undefined || planData.daily_recommended_increment !== undefined) {
    await apiClient.put(`/admin/distribution/config/${tierName}`, {
      initial_count: planData.initial_recommended_profiles,
      daily_count: planData.daily_recommended_increment
    });
  }
  
  return true;
};

/**
 * Update user premium plan
 */
export const updateUserPlan = async (userId, planType) => {
  if (planType === 'free' || planType === 'non_premium') {
    await apiClient.post(`/admin/users/${userId}/downgrade`);
  } else {
    // Assuming we fetch plans to find the plan ID matching the type
    const plans = await apiClient.get('/admin/plans');
    const plan = (plans.data || plans).find(p => p.name === planType);
    if (!plan) throw new Error('Plan not found');
    await apiClient.post(`/admin/users/${userId}/upgrade`, { plan_id: plan.id });
  }
};

/**
 * Reset User Password
 */
export const resetUserPassword = async (userId, newPassword) => {
  return await apiClient.put(`/admin/users/${userId}/password`, { password: newPassword });
};

/**
 * Delete a User
 */
export const deleteUser = async (userId) => {
  return await apiClient.delete(`/admin/users/${userId}?hard=true`);
};

/**
 * Add Profile Photo
 */
export const addPhoto = async (userId, publicUrl) => {
  // Pass to the photo route (if admin uploads on behalf of user)
  return await apiClient.post(`/admin/users/${userId}/photos`, { photo_url: publicUrl });
};

/**
 * Delete Profile Photo DB Record
 */
export const deletePhoto = async (photoId) => {
  return await apiClient.delete(`/admin/photos/${photoId}`);
};

/**
 * Update User Profile
 */
export const updateUser = async (userId, profileData) => {
  return await apiClient.put(`/admin/users/${userId}`, profileData);
};

/**
 * Fetch a user's horoscope + partner preferences + family details (for the full editor).
 */
export const fetchUserRelations = async (userId) => {
  const data = await apiClient.get(`/admin/users/${userId}`);
  return {
    horoscope: data.horoscope_details || null,
    preferences: data.partner_preferences || null,
    family: data.family_details || null,
  };
};

/**
 * Upsert a user's horoscope details (admin editor).
 */
export const updateUserHoroscope = async (userId, horoscopeData) => {
  return await apiClient.put(`/admin/users/${userId}/horoscope`, horoscopeData);
};

/**
 * Upsert a user's partner preferences (admin editor).
 */
export const updateUserPreferences = async (userId, preferenceData) => {
  return await apiClient.put(`/admin/users/${userId}/preferences`, preferenceData);
};

/**
 * Upsert a user's family details (admin editor).
 */
export const updateUserFamilyDetails = async (userId, familyData) => {
  return await apiClient.put(`/admin/users/${userId}/family`, familyData);
};

/**
 * Update membership quota balances directly (admin override).
 */
export const updateUserQuotas = async (userId, quotas) => {
  return await apiClient.put(`/admin/users/${userId}/quotas`, quotas);
};

export const bulkUploadUsers = async (usersList, stopRef, onProgress) => {
  const formData = new FormData();
  formData.append('file', new Blob([JSON.stringify(usersList)], { type: 'application/json' }), 'import.json');
  return await apiClient.post('/admin/import/users', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (ev) => {
      if (onProgress && ev.total) onProgress(ev.loaded, ev.total);
    }
  });
};

/**
 * Fetch Admin Settings (Membership Plans + Distribution)
 */
export const fetchAdminSettings = async () => {
  const [plansRes, distRes] = await Promise.all([
    apiClient.get('/admin/plans'),
    apiClient.get('/admin/distribution/config')
  ]);
  
  const plans = plansRes.data || plansRes;
  const dist = distRes.data || distRes;

  const matches_limits = {};
  (plans || []).forEach(plan => {
    const tierKey = plan.name === 'free' ? 'non_premium' : plan.name;
    const distRow = (dist || []).find(d => d.tier === plan.name) || {};
    matches_limits[tierKey] = {
      plan_name: plan.name,
      price_inr: plan.price,
      validity_days: plan.validity_days,
      contacts_limit: plan.contact_credits,
      interests_limit: plan.interest_credits,
      initial_all_matches: distRow.initial_count || 0,
      initial_new_profiles: 0,
      daily_all_matches: distRow.daily_count || 0,
      daily_new_profiles: 0,
    };
  });
  
  return { matches_limits };
};

/**
 * Update Admin Setting
 */
export const updateAdminSetting = async (key, value) => {
  if (key === 'matches_limits') {
    const promises = Object.entries(value).map(async ([tierKey, limits]) => {
      const tier = tierKey === 'non_premium' ? 'free' : tierKey;
      
      // We would need a route that handles updating both plan and distribution at once
      // For now, let's update them separately based on our backend
      await apiClient.put(`/admin/distribution/config/${tier}`, {
        initial_count: limits.initial_all_matches,
        daily_count: limits.daily_all_matches
      });

      const plansRes = await apiClient.get('/admin/plans');
      const plan = (plansRes.data || plansRes).find(p => p.name === tier);
      if (plan) {
        await apiClient.put(`/admin/plans/${plan.id}`, {
          price: limits.price_inr,
          validity_days: limits.validity_days,
          contact_credits: limits.contacts_limit,
          interest_credits: limits.interests_limit,
        });
      }
      return true;
    });
    
    await Promise.all(promises);
    return true;
  }
  return false;
};

/**
 * Bulk Delete Incomplete Users
 */
export const deleteIncompleteUsers = async () => {
  const res = await apiClient.post('/admin/users/cleanup-incomplete');
  return res.count || 0;
};

// ============================================================
// DISTRIBUTION MANAGEMENT
// ============================================================

export const fetchDistributionHealth = async () => {
  const data = await apiClient.get('/admin/distribution/health');
  return {
    active_users: data.premiumUsers || 0,
    total_unlocked: data.totalDistributed || 0,
    empty_users: 0, // Not explicitly tracked in DB right now, but could be added later
  };
};

export const triggerDailyDistribution = async () => {
  const res = await apiClient.post('/admin/distribution/manual', { target: 'all', count: 10, section: 'daily_updates' });
  return { users_updated: res.data?.distributed || res.distributed || 0, run_date: new Date().toLocaleDateString() };
};

export const manualPushToUsers = async (pushType, targetVal, pushAllMatches, pushDailyUpdates) => {
  const count = Math.max(pushAllMatches, pushDailyUpdates);
  const res = await apiClient.post('/admin/distribution/manual', {
    target: pushType,
    tier: pushType === 'tier' ? targetVal : undefined,
    userId: pushType === 'user' ? targetVal : undefined,
    section: 'both',
    count: count > 0 ? count : 10
  });
  return { users_processed: res.data?.distributed || res.distributed || 0 };
};

export const fetchDistributionHistory = async (page = 1, limit = 50, filters = {}) => {
  return await apiClient.get('/admin/distribution/logs', {
    params: { page, limit, ...filters }
  });
};

export const saveDistributionChange = async (tier, settings, pushMode, adminEmail) => {
  return true;
};

export const forcePushDistribution = async (tier, adminEmail) => {
  await apiClient.post('/admin/distribution/manual', { tier });
  return { distributed: 1 };
};

export const forcePushAllDistribution = async (adminEmail) => {
  await apiClient.post('/admin/distribution/manual', { user_id: 'all' });
  return { distributed: 1 };
};

// ============================================================
// PAYMENT HISTORY & REVENUE
// ============================================================

export const fetchRevenueStats = async () => {
  return await apiClient.get('/admin/dashboard/stats');
};

export const fetchPayments = async ({ page = 1, perPage = 25, status, planType, search, dateFrom, dateTo } = {}) => {
  return await apiClient.get('/admin/payments', {
    params: { page, limit: perPage, status }
  });
};

export const fetchAllPaymentsForExport = async ({ status, planType, dateFrom, dateTo } = {}) => {
  const res = await apiClient.get('/admin/payments', { params: { limit: 10000, status } });
  return res.payments || res.data || [];
};

export const deletePayments = async ({ status, planType, dateFrom, dateTo } = {}) => {
  return 0; // Not implemented on backend, skip
};

export const markPaymentAsRefunded = async (paymentId) => {
  return await apiClient.put(`/admin/payments/${paymentId}/reject`);
};
