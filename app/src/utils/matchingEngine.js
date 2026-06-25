/**
 * Wedring Matrimony — Matching Engine
 * Multi-factor compatibility scoring
 */
import { calculateStarCompatibility } from './starCompatibility';

/**
 * Matching factor weights (total = 100%)
 */
const WEIGHTS = {
  agePreference: 15,
  religion: 15,
  caste: 10,
  location: 10,
  education: 10,
  income: 10,
  starCompatibility: 10,
  foodHabit: 5,
  heightPreference: 5,
  profileCompleteness: 5,
  verificationStatus: 5,
};

/**
 * Calculate overall compatibility score between two profiles
 * @param {object} userProfile - Current user's profile
 * @param {object} userPreferences - Current user's partner preferences
 * @param {object} candidateProfile - Profile to check compatibility with
 * @param {object} userHoroscope - Current user's horoscope
 * @param {object} candidateHoroscope - Candidate's horoscope
 * @returns {object} Compatibility result with breakdown
 */
export const calculateCompatibility = (
  userProfile,
  userPreferences,
  candidateProfile,
  userHoroscope = null,
  candidateHoroscope = null
) => {
  const scores = {};
  let totalScore = 0;

  // 1. Age Preference (15%)
  if (userPreferences?.age_min && userPreferences?.age_max && candidateProfile?.date_of_birth) {
    const age = calculateAge(candidateProfile.date_of_birth);
    const inRange = age >= userPreferences.age_min && age <= userPreferences.age_max;
    scores.agePreference = inRange ? WEIGHTS.agePreference : 0;
  } else {
    scores.agePreference = WEIGHTS.agePreference * 0.5; // Partial if no preference set
  }

  // 2. Religion Match (15%)
  if (userPreferences?.religion?.length > 0 && candidateProfile?.religion) {
    scores.religion = userPreferences.religion.includes(candidateProfile.religion)
      ? WEIGHTS.religion : 0;
  } else if (userProfile?.religion === candidateProfile?.religion) {
    scores.religion = WEIGHTS.religion;
  } else {
    scores.religion = 0;
  }

  // 3. Caste Match (10%)
  if (userPreferences?.caste?.includes('Caste No Bar')) {
    scores.caste = WEIGHTS.caste;
  } else if (userPreferences?.caste?.length > 0 && candidateProfile?.caste) {
    scores.caste = userPreferences.caste.includes(candidateProfile.caste)
      ? WEIGHTS.caste : 0;
  } else if (userProfile?.caste === candidateProfile?.caste) {
    scores.caste = WEIGHTS.caste;
  } else {
    scores.caste = WEIGHTS.caste * 0.3;
  }

  // 4. Location Proximity (10%)
  if (userProfile?.city && candidateProfile?.city) {
    if (userProfile.city === candidateProfile.city) {
      scores.location = WEIGHTS.location;
    } else if (userProfile.district === candidateProfile.district) {
      scores.location = WEIGHTS.location * 0.7;
    } else if (userProfile.state === candidateProfile.state) {
      scores.location = WEIGHTS.location * 0.4;
    } else {
      scores.location = WEIGHTS.location * 0.1;
    }
  } else {
    scores.location = WEIGHTS.location * 0.2;
  }

  // 5. Education Match (10%)
  if (userPreferences?.education?.includes('No Education Bar')) {
    scores.education = WEIGHTS.education;
  } else if (userPreferences?.education?.length > 0 && candidateProfile?.education) {
    scores.education = userPreferences.education.includes(candidateProfile.education)
      ? WEIGHTS.education : WEIGHTS.education * 0.3;
  } else {
    scores.education = WEIGHTS.education * 0.5;
  }

  // 6. Income Compatibility (10%)
  scores.income = WEIGHTS.income * 0.5; // Default partial score

  // 7. Star Compatibility (10%)
  if (userHoroscope?.star && candidateHoroscope?.star) {
    const starResult = calculateStarCompatibility(
      userHoroscope.star,
      candidateHoroscope.star
    );
    scores.starCompatibility = Math.round(WEIGHTS.starCompatibility * (starResult.percentage / 100));
  } else {
    scores.starCompatibility = 0;
  }

  // 8. Food Habit (5%)
  const hasUserFoodPref = userPreferences?.food_habit && userPreferences.food_habit.length > 0;
  const isCandidateFoodSpecified = !!candidateProfile?.food_habit;

  if (!hasUserFoodPref || !isCandidateFoodSpecified) {
    // Non-blocking: full points awarded if user has no preference or candidate detail is omitted
    scores.foodHabit = WEIGHTS.foodHabit;
  } else {
    scores.foodHabit = userPreferences.food_habit.includes(candidateProfile.food_habit)
      ? WEIGHTS.foodHabit : 0;
  }

  // 9. Height Preference (5%)
  if (userPreferences?.height_min && userPreferences?.height_max && candidateProfile?.height_cm) {
    const inRange = candidateProfile.height_cm >= userPreferences.height_min &&
      candidateProfile.height_cm <= userPreferences.height_max;
    scores.heightPreference = inRange ? WEIGHTS.heightPreference : 0;
  } else {
    scores.heightPreference = WEIGHTS.heightPreference * 0.5;
  }

  // 10. Profile Completeness (5%)
  scores.profileCompleteness = Math.round(
    WEIGHTS.profileCompleteness * ((candidateProfile?.profile_completion || 50) / 100)
  );

  // 11. Verification Status (5%)
  scores.verificationStatus = candidateProfile?.is_verified
    ? WEIGHTS.verificationStatus : 0;

  // Calculate total
  totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return {
    totalScore: Math.min(totalScore, 100),
    breakdown: scores,
    verdict: totalScore >= 80 ? 'Excellent Match' :
      totalScore >= 60 ? 'Good Match' :
      totalScore >= 40 ? 'Average Match' : 'Below Average',
  };
};

/**
 * Calculate age from date of birth string
 */
const calculateAge = (dob) => {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default calculateCompatibility;
