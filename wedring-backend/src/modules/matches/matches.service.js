/**
 * Wedring Backend — Matches Service
 */
import { supabaseAdmin } from '../../config/supabase.js';
import { calculateCompatibility } from '../../utils/compatibility.js';

/**
 * Get all matches from distributed profiles
 */
export async function getAllMatches(userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('user_distributed_profiles')
    .select(`
      *,
      profile:profile_id (
        id, user_id, full_name, gender, dob, height_cm, marital_status,
        religion, caste, highest_qualification, occupation, annual_income,
        state, district, city, about_me, rasi, nakshatra
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('section', 'all_matches')
    .order('distributed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Fetch photos for all matched profiles
  const profileIds = (data || []).map(d => d.profile_id).filter(Boolean);
  let photosMap = {};

  if (profileIds.length > 0) {
    const { data: photos } = await supabaseAdmin
      .from('profile_photos')
      .select('user_id, id, r2_url, is_primary, display_order')
      .in('user_id', profileIds);

    (photos || []).forEach(p => {
      if (!photosMap[p.user_id]) photosMap[p.user_id] = [];
      photosMap[p.user_id].push(p);
    });
  }

  // Fetch viewer's preferences and profile for compatibility scoring
  const [{ data: viewerPrefs }, { data: viewerProfile }] = await Promise.all([
    supabaseAdmin.from('partner_preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabaseAdmin.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  const results = (data || []).map(item => {
    const profile = item.profile || {};
    const compatibility = calculateCompatibility(profile, viewerPrefs, viewerProfile);
    return {
      ...item,
      profile: {
        ...profile,
        profile_photos: photosMap[item.profile_id] || [],
      },
      compatibility_percentage: compatibility,
    };
  });

  return { matches: results, total: count || 0 };
}

/**
 * Get daily updates from distributed profiles
 */
export async function getDailyUpdates(userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('user_distributed_profiles')
    .select(`
      *,
      profile:profile_id (
        id, user_id, full_name, gender, dob, height_cm, marital_status,
        religion, caste, highest_qualification, occupation, annual_income,
        state, district, city, about_me, rasi, nakshatra
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('section', 'daily_updates')
    .order('distributed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Fetch photos
  const profileIds = (data || []).map(d => d.profile_id).filter(Boolean);
  let photosMap = {};

  if (profileIds.length > 0) {
    const { data: photos } = await supabaseAdmin
      .from('profile_photos')
      .select('user_id, id, r2_url, is_primary, display_order')
      .in('user_id', profileIds);

    (photos || []).forEach(p => {
      if (!photosMap[p.user_id]) photosMap[p.user_id] = [];
      photosMap[p.user_id].push(p);
    });
  }

  const results = (data || []).map(item => ({
    ...item,
    profile: {
      ...(item.profile || {}),
      profile_photos: photosMap[item.profile_id] || [],
    },
  }));

  return { matches: results, total: count || 0 };
}

/**
 * Calculate compatibility between current user and target
 */
export async function getCompatibility(userId, targetUserId) {
  const [{ data: viewerProfile }, { data: viewerPrefs }, { data: targetProfile }] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabaseAdmin.from('partner_preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabaseAdmin.from('profiles').select('*').eq('user_id', targetUserId).maybeSingle(),
  ]);

  if (!targetProfile) {
    const err = new Error('Target profile not found');
    err.statusCode = 404;
    throw err;
  }

  const score = calculateCompatibility(targetProfile, viewerPrefs, viewerProfile);
  return { compatibility_percentage: score, user_id: targetUserId };
}

export default { getAllMatches, getDailyUpdates, getCompatibility };
