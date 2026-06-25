/**
 * Profile Completeness Engine — single source of truth for completion scoring.
 * Weighted by section so the % is meaningful, and reports exactly which
 * sections/fields are still missing. Used by registration completion, the
 * profile dashboard, and (optionally) admin.
 *
 * Weights (total 100):
 *   Basic Details 20 | Religion 10 | Family 15 | Horoscope 10
 *   Education 15 | Lifestyle 10 | Photos 10 | Partner Preferences 10
 */

const SECTIONS = [
  {
    key: 'basic', label: 'Basic Details', weight: 20,
    fields: [
      ['display_name', 'Full Name'],
      ['gender', 'Gender'],
      ['date_of_birth', 'Date of Birth'],
      ['height_cm', 'Height'],
      ['marital_status', 'Marital Status'],
    ],
  },
  {
    key: 'religion', label: 'Religion & Community', weight: 10,
    fields: [['religion', 'Religion'], ['caste', 'Caste']],
  },
  {
    key: 'family', label: 'Family & Location', weight: 15,
    fields: [
      ['family_type', 'Family Type'],
      ['father_occupation', "Father's Occupation"],
      ['city', 'City'],
      ['district', 'District'],
    ],
  },
  {
    key: 'horoscope', label: 'Horoscope', weight: 10,
    fields: [['star', 'Star'], ['raasi', 'Raasi']],
    source: 'horoscope',
  },
  {
    key: 'education', label: 'Education & Career', weight: 15,
    fields: [['education', 'Education'], ['occupation', 'Occupation']],
  },
  {
    key: 'lifestyle', label: 'Lifestyle', weight: 10,
    fields: [['food_habit', 'Food Habit'], ['languages_known', 'Languages Known']],
  },
  {
    key: 'photos', label: 'Photos', weight: 10,
    source: 'photos',
  },
  {
    key: 'preferences', label: 'Partner Preferences', weight: 10,
    fields: [['pref_age_min', 'Min Age'], ['pref_age_max', 'Max Age']],
    source: 'preferences',
  },
];

const hasValue = (v) => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

/**
 * @param {object} profile - public.profiles row (may include nested relations)
 * @param {object} [opts]  - { horoscope, preferences, photos } if not nested on profile
 * @returns {{ percent:number, missingSections:string[], missingFields:string[], sections:Array }}
 */
export const computeCompleteness = (profile, opts = {}) => {
  const horoscope = opts.horoscope || profile?.horoscope_details || profile?.horoscope || {};
  const preferences = opts.preferences || profile?.partner_preferences || profile?.partnerPreferences || {};
  const photos = opts.photos || profile?.photos || [];

  let earned = 0;
  const missingSections = [];
  const missingFields = [];
  const sections = [];

  for (const sec of SECTIONS) {
    let secScore;
    if (sec.key === 'photos') {
      secScore = (photos && photos.length > 0) ? 1 : 0;
      if (secScore === 0) missingFields.push('At least one photo');
    } else {
      const src = sec.source === 'horoscope' ? horoscope
        : sec.source === 'preferences' ? preferences
        : (profile || {});
      const total = sec.fields.length;
      let filled = 0;
      for (const [k, label] of sec.fields) {
        if (hasValue(src?.[k])) filled++;
        else missingFields.push(label);
      }
      secScore = total ? filled / total : 0;
    }

    earned += sec.weight * secScore;
    const pct = Math.round(secScore * 100);
    sections.push({ key: sec.key, label: sec.label, weight: sec.weight, percent: pct, complete: secScore >= 1 });
    if (secScore < 1) missingSections.push(sec.label);
  }

  return {
    percent: Math.round(earned),
    missingSections,
    missingFields,
    sections,
  };
};

export default computeCompleteness;
