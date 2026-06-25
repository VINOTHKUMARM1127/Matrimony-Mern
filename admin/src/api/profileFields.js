/**
 * Shared profile field mapping — the single source of truth for which columns
 * live on which table. Used by Bulk Upload AND the Manage-User editor so the two
 * never drift apart. Every key here matches the unified wedring_schema.sql and the
 * 8-step mobile registration flow.
 */

// Scalar columns on public.profiles
export const PROFILE_SCALAR_FIELDS = [
  'name', 'gender', 'date_of_birth', 'height_cm', 'weight_kg', 'physical_status',
  'marital_status', 'religion', 'caste', 'about_me',
  'country', 'state', 'district', 'city',
  'highest_qualification', 'occupation', 'annual_income',
  'food_habit', 'drinking_habit', 'smoking_habit',
];

// Array columns on public.profiles
export const PROFILE_ARRAY_FIELDS = ['languages_known', 'interests', 'hobbies'];

// Integer columns on public.profiles (coerced)
export const PROFILE_INT_FIELDS = ['height_cm', 'weight_kg'];

// horoscope_details columns
export const HOROSCOPE_FIELDS = ['rasi', 'nakshatra', 'lagnam', 'gothram', 'dosham', 'horoscope_notes'];

// partner_preferences columns
export const PREFERENCE_SCALAR_FIELDS = ['pref_age_min', 'pref_age_max', 'pref_height_min', 'pref_height_max', 'pref_food_habit'];
export const PREFERENCE_ARRAY_FIELDS = ['pref_religion', 'pref_caste', 'pref_education', 'pref_occupation', 'pref_marital_status', 'pref_location'];

// family_details columns
export const FAMILY_FIELDS = [
  'father_name', 'mother_name', 'family_type', 'family_status', 'family_values',
  'number_of_brothers', 'number_of_sisters',
];

const toInt = (v) => (v === '' || v === null || v === undefined ? null : (parseInt(v, 10) || 0));
const toArray = (v) => {
  if (v === null || v === undefined || v === '') return undefined;
  if (Array.isArray(v)) return v;
  // Allow comma-separated strings in bulk JSON for convenience.
  return String(v).split(',').map((s) => s.trim()).filter(Boolean);
};

/**
 * Build the public.profiles update/insert payload from a flat input object.
 * Only includes keys actually present on the input (so partial edits are safe).
 */
export const buildProfilePayload = (input, { includeUndefined = false } = {}) => {
  const out = {};
  for (const k of PROFILE_SCALAR_FIELDS) {
    if (k in input) {
      out[k] = PROFILE_INT_FIELDS.includes(k) ? toInt(input[k]) : (input[k] === '' ? null : input[k]);
    } else if (includeUndefined) {
      out[k] = null;
    }
  }
  for (const k of PROFILE_ARRAY_FIELDS) {
    if (k in input) {
      const arr = toArray(input[k]);
      if (arr !== undefined) out[k] = arr;
    }
  }
  return out;
};

/** Build horoscope_details payload; returns null if no horoscope keys present. */
export const buildHoroscopePayload = (input) => {
  const out = {};
  for (const k of HOROSCOPE_FIELDS) {
    if (k in input && input[k] !== '' && input[k] !== null && input[k] !== undefined) out[k] = input[k];
  }
  return Object.keys(out).length ? out : null;
};

/** Build partner_preferences payload; returns null if no preference keys present. */
export const buildPreferencePayload = (input) => {
  const out = {};
  for (const k of PREFERENCE_SCALAR_FIELDS) {
    if (k in input && input[k] !== '' && input[k] !== null && input[k] !== undefined) out[k] = toInt(input[k]);
  }
  for (const k of PREFERENCE_ARRAY_FIELDS) {
    if (k in input) {
      const arr = toArray(input[k]);
      if (arr !== undefined) out[k] = arr;
    }
  }
  return Object.keys(out).length ? out : null;
};

/** Build family_details payload; returns null if no family keys present. */
export const buildFamilyPayload = (input) => {
  const out = {};
  for (const k of FAMILY_FIELDS) {
    if (k in input && input[k] !== '' && input[k] !== null && input[k] !== undefined) {
      out[k] = ['number_of_brothers', 'number_of_sisters'].includes(k) ? toInt(input[k]) : input[k];
    }
  }
  return Object.keys(out).length ? out : null;
};
