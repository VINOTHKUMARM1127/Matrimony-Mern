/**
 * Wedring Backend — Compatibility Score Algorithm
 *
 * Score breakdown (total 100):
 *   Religion match           → 15 pts
 *   Caste match              → 10 pts
 *   Age within preference    → 15 pts
 *   Height within preference → 10 pts
 *   Education match          → 10 pts
 *   Occupation match         → 10 pts
 *   Location (same state)    → 10 pts
 *   Horoscope (rasi/naksh)   → 15 pts
 *   Lifestyle match          → 5 pts
 *
 * If a preference field is empty, that factor is skipped and its weight
 * is redistributed proportionally among the remaining factors.
 */

const FACTORS = [
  { key: 'religion',   weight: 15 },
  { key: 'caste',      weight: 10 },
  { key: 'age',        weight: 15 },
  { key: 'height',     weight: 10 },
  { key: 'education',  weight: 10 },
  { key: 'occupation', weight: 10 },
  { key: 'location',   weight: 10 },
  { key: 'horoscope',  weight: 15 },
  { key: 'lifestyle',  weight: 5  },
];

/**
 * Calculate age from DOB
 */
function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Check if value is in array (case-insensitive)
 */
function inArray(arr, value) {
  if (!arr || !Array.isArray(arr) || arr.length === 0 || !value) return null; // skip
  return arr.some(v => v.toLowerCase() === value.toLowerCase());
}

/**
 * Calculate compatibility between a user's profile/prefs and a target profile.
 *
 * @param {object} targetProfile - The target user's profile data
 * @param {object} userPrefs - The current user's partner preferences
 * @param {object} userProfile - The current user's own profile (for horoscope comparison)
 * @returns {number} Score from 0 to 100
 */
export function calculateCompatibility(targetProfile, userPrefs, userProfile = {}) {
  if (!targetProfile || !userPrefs) return 0;

  const scores = [];

  // 1. Religion
  if (userPrefs.religion && Array.isArray(userPrefs.religion) && userPrefs.religion.length > 0) {
    const match = inArray(userPrefs.religion, targetProfile.religion);
    if (match !== null) scores.push({ key: 'religion', weight: 15, score: match ? 1 : 0 });
  }

  // 2. Caste
  if (userPrefs.caste && Array.isArray(userPrefs.caste) && userPrefs.caste.length > 0) {
    const match = inArray(userPrefs.caste, targetProfile.caste);
    if (match !== null) scores.push({ key: 'caste', weight: 10, score: match ? 1 : 0 });
  }

  // 3. Age
  if (userPrefs.age_min || userPrefs.age_max) {
    const age = calculateAge(targetProfile.dob);
    if (age !== null) {
      const min = userPrefs.age_min || 18;
      const max = userPrefs.age_max || 60;
      const inRange = age >= min && age <= max;
      // Partial score if close
      let score = 0;
      if (inRange) {
        score = 1;
      } else {
        const diff = age < min ? min - age : age - max;
        score = Math.max(0, 1 - diff * 0.15); // lose 15% per year outside
      }
      scores.push({ key: 'age', weight: 15, score });
    }
  }

  // 4. Height
  if (userPrefs.height_min_cm || userPrefs.height_max_cm) {
    const h = targetProfile.height_cm;
    if (h) {
      const min = userPrefs.height_min_cm || 120;
      const max = userPrefs.height_max_cm || 220;
      const inRange = h >= min && h <= max;
      let score = 0;
      if (inRange) {
        score = 1;
      } else {
        const diff = h < min ? min - h : h - max;
        score = Math.max(0, 1 - diff * 0.1);
      }
      scores.push({ key: 'height', weight: 10, score });
    }
  }

  // 5. Education
  if (userPrefs.education && Array.isArray(userPrefs.education) && userPrefs.education.length > 0) {
    const match = inArray(userPrefs.education, targetProfile.highest_qualification);
    if (match !== null) scores.push({ key: 'education', weight: 10, score: match ? 1 : 0 });
  }

  // 6. Occupation
  if (userPrefs.occupation && Array.isArray(userPrefs.occupation) && userPrefs.occupation.length > 0) {
    const match = inArray(userPrefs.occupation, targetProfile.occupation);
    if (match !== null) scores.push({ key: 'occupation', weight: 10, score: match ? 1 : 0 });
  }

  // 7. Location (same state)
  if (userProfile.state && targetProfile.state) {
    const match = userProfile.state.toLowerCase() === targetProfile.state.toLowerCase();
    let score = match ? 1 : 0;
    // Bonus for same district/city
    if (match && userProfile.district && targetProfile.district) {
      if (userProfile.district.toLowerCase() === targetProfile.district.toLowerCase()) {
        score = 1;
      }
    }
    scores.push({ key: 'location', weight: 10, score });
  }

  // 8. Horoscope (rasi + nakshatra)
  if (userProfile.rasi || userProfile.nakshatra) {
    let horoScore = 0;
    let horoFactors = 0;
    if (userProfile.rasi && targetProfile.rasi) {
      horoFactors++;
      if (userProfile.rasi.toLowerCase() === targetProfile.rasi.toLowerCase()) horoScore += 1;
    }
    if (userProfile.nakshatra && targetProfile.nakshatra) {
      horoFactors++;
      if (userProfile.nakshatra.toLowerCase() === targetProfile.nakshatra.toLowerCase()) horoScore += 1;
    }
    if (horoFactors > 0) {
      scores.push({ key: 'horoscope', weight: 15, score: horoScore / horoFactors });
    }
  }

  // 9. Lifestyle
  if (userPrefs.food_habits && Array.isArray(userPrefs.food_habits) && userPrefs.food_habits.length > 0) {
    const lifestyle = targetProfile.lifestyle_prefs || {};
    const match = inArray(userPrefs.food_habits, lifestyle.food_habit || '');
    if (match !== null) scores.push({ key: 'lifestyle', weight: 5, score: match ? 1 : 0 });
  }

  // If no factors could be evaluated, return 50 (neutral)
  if (scores.length === 0) return 50;

  // Redistribute weights proportionally
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const scaleFactor = 100 / totalWeight;

  const finalScore = scores.reduce((sum, s) => {
    return sum + s.score * s.weight * scaleFactor;
  }, 0);

  return Math.round(Math.min(100, Math.max(0, finalScore)));
}

export default { calculateCompatibility };
