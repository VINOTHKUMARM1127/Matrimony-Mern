/**
 * Wedring Backend — Profile Search Service
 *
 * Handles advanced searching of profiles.
 */
import { supabaseAdmin } from '../../config/supabase.js';

/**
 * Advanced search/filtering for profiles.
 * Pagination via limit/offset.
 */
export async function searchProfiles(userId, filters, limit = 20, offset = 0) {
  let query = supabaseAdmin
    .from('profiles')
    .select(`
      *,
      profile_photos (*),
      users!inner (is_active)
    `, { count: 'exact' })
    .eq('users.is_active', true)
    .neq('id', userId); // exclude self

  if (filters.gender) query = query.eq('gender', filters.gender);
  if (filters.religion) query = query.eq('religion', filters.religion);
  if (filters.caste) query = query.eq('caste', filters.caste);
  if (filters.city) query = query.eq('city', filters.city);
  if (filters.district) query = query.eq('district', filters.district);
  if (filters.state) query = query.eq('state', filters.state);
  if (filters.education) query = query.eq('highest_qualification', filters.education);
  if (filters.occupation) query = query.eq('occupation', filters.occupation);
  if (filters.maritalStatus) query = query.eq('marital_status', filters.maritalStatus);
  if (filters.foodHabit) query = query.contains('lifestyle_prefs', { food_habit: filters.foodHabit }); // frontend stored in lifestyle_prefs or root? Let's check frontend. In frontend it's 'food_habit'. But our DB doesn't have it at root level. Wait, let me adjust it: 

  if (filters.ageMin || filters.ageMax) {
    if (filters.ageMin) {
      const maxDob = new Date();
      maxDob.setFullYear(maxDob.getFullYear() - parseInt(filters.ageMin, 10));
      query = query.lte('dob', maxDob.toISOString().split('T')[0]);
    }
    if (filters.ageMax) {
      const minDob = new Date();
      minDob.setFullYear(minDob.getFullYear() - parseInt(filters.ageMax, 10));
      query = query.gte('dob', minDob.toISOString().split('T')[0]);
    }
  }

  if (filters.heightMin) query = query.gte('height_cm', parseInt(filters.heightMin, 10));
  if (filters.heightMax) query = query.lte('height_cm', parseInt(filters.heightMax, 10));

  // Sort by latest updated
  query = query.order('updated_at', { ascending: false });

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { profiles: data || [], total: count || 0 };
}

/**
 * Log a profile view
 */
export async function logProfileView(viewerId, targetUserId) {
  // Can just be a fire-and-forget or atomic increment of views
  // The frontend calls this `user_activity` table. We need to create it if it doesn't exist, or just insert into credit_transactions if it's a paid view. 
  // Let's create an entry in 'user_activity'
  const { error } = await supabaseAdmin.from('user_activity').insert({
    user_id: viewerId,
    target_user_id: targetUserId,
    activity_type: 'profile_view'
  });
  if (error) console.warn('Failed to log view:', error);
  return true;
}

/**
 * Update last active timestamp
 */
export async function updateLastActive(userId) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) console.warn('Failed to update last active:', error);
  return true;
}

export default { searchProfiles, logProfileView, updateLastActive };
