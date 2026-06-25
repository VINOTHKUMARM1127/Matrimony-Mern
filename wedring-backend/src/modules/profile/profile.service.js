/**
 * Wedring Backend — Profile Service
 */
import { supabaseAdmin } from '../../config/supabase.js';
import logger from '../../utils/logger.js';

// ------------------------------------------------------------------
// Profile completion weight map
// ------------------------------------------------------------------
const COMPLETION_WEIGHTS = {
  full_name: 10,
  gender: 5,
  dob: 10,
  height_cm: 5,
  marital_status: 5,
  religion: 5,
  caste: 5,
  highest_qualification: 10,
  occupation: 5,
  annual_income: 5,
  state: 5,
  district: 5,
  city: 5,
  about_me: 5,
  rasi: 5,
  nakshatra: 5,
};

function calculateCompletionPct(profile) {
  if (!profile) return 0;
  let earned = 0;
  let total = 0;
  for (const [field, weight] of Object.entries(COMPLETION_WEIGHTS)) {
    total += weight;
    if (profile[field] !== null && profile[field] !== undefined && profile[field] !== '') {
      earned += weight;
    }
  }
  return total > 0 ? Math.round((earned / total) * 100) : 0;
}

// ------------------------------------------------------------------
// Profile CRUD
// ------------------------------------------------------------------

/**
 * Get current user's full profile
 */
export async function getOwnProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      profile_photos (*),
      partner_preferences (*),
      user_memberships (*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  // Also fetch user table data
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('email, mobile, profile_for, mother_tongue, membership_tier, profile_complete_pct, is_active')
    .eq('id', userId)
    .single();

  return { ...data, ...userData };
}

/**
 * Get public profile of another user
 */
export async function getPublicProfile(targetUserId, viewerUserId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      profile_photos (*)
    `)
    .eq('user_id', targetUserId)
    .single();

  if (error) throw error;

  // Check viewer's membership tier for contact/horoscope visibility
  const { data: viewer } = await supabaseAdmin
    .from('users')
    .select('membership_tier')
    .eq('id', viewerUserId)
    .single();

  const isFree = !viewer || viewer.membership_tier === 'free';

  // Mask sensitive fields for free users
  const result = { ...data };
  if (isFree) {
    result.mobile = null;
    result._contact_locked = true;
    result._horoscope_locked = true;
  }

  return result;
}

/**
 * Upsert a profile section and recalculate completion
 */
export async function upsertProfileSection(userId, fields) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      { user_id: userId, ...fields, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;

  // Recalculate completion
  const pct = calculateCompletionPct(data);
  await supabaseAdmin
    .from('users')
    .update({ profile_complete_pct: pct, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return { ...data, profile_complete_pct: pct };
}

/**
 * Upsert partner preferences
 */
export async function upsertPartnerPreferences(userId, prefs) {
  const { data, error } = await supabaseAdmin
    .from('partner_preferences')
    .upsert(
      { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ------------------------------------------------------------------
// Master Data (loaded from JSON files)
// ------------------------------------------------------------------
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', '..', 'data');

function loadJson(file) {
  try {
    return JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
  } catch {
    return [];
  }
}

let _states, _districts, _cities, _castes;

export function getStates() {
  if (!_states) _states = loadJson('states.json');
  return _states;
}

export function getDistricts(state) {
  if (!_districts) _districts = loadJson('districts.json');
  if (state) {
    return (_districts[state] || []);
  }
  return _districts;
}

export function getCities(district) {
  if (!_cities) _cities = loadJson('cities.json');
  if (district) {
    return (_cities[district] || []);
  }
  return _cities;
}

export function getCastes(religion) {
  if (!_castes) _castes = loadJson('castes.json');
  if (religion) {
    return (_castes[religion] || []);
  }
  return _castes;
}

export default {
  getOwnProfile, getPublicProfile,
  upsertProfileSection, upsertPartnerPreferences,
  getStates, getDistricts, getCities, getCastes,
};
