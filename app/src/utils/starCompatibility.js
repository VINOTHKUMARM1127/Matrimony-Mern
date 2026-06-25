/**
 * Wedring Matrimony — Star Compatibility Engine
 * Traditional Tamil 10-Porutham matching algorithm
 */

/**
 * Star (Nakshatra) index mapping for compatibility calculations
 */
const STAR_INDEX = {
  Ashwini: 0, Bharani: 1, Karthigai: 2, Rohini: 3, Mrigashirsha: 4,
  Thiruvathirai: 5, Punarpoosam: 6, Poosam: 7, Ayilyam: 8,
  Magam: 9, Pooram: 10, Uthiram: 11, Hastham: 12, Chithirai: 13,
  Swathi: 14, Visakam: 15, Anusham: 16, Kettai: 17,
  Moolam: 18, Pooradam: 19, Uthiradam: 20, Thiruvonam: 21,
  Avittam: 22, Sathayam: 23, Poorattathi: 24, Uthirattathi: 25, Revathi: 26,
};

/**
 * Raasi (Moon Sign) mapping - each star belongs to a raasi
 */
const STAR_TO_RAASI = {
  Ashwini: 'Mesham', Bharani: 'Mesham', Karthigai: 'Rishabam',
  Rohini: 'Rishabam', Mrigashirsha: 'Mithunam', Thiruvathirai: 'Mithunam',
  Punarpoosam: 'Kadagam', Poosam: 'Kadagam', Ayilyam: 'Kadagam',
  Magam: 'Simmam', Pooram: 'Simmam', Uthiram: 'Kanni',
  Hastham: 'Kanni', Chithirai: 'Thulam', Swathi: 'Thulam',
  Visakam: 'Viruchigam', Anusham: 'Viruchigam', Kettai: 'Viruchigam',
  Moolam: 'Dhanusu', Pooradam: 'Dhanusu', Uthiradam: 'Magaram',
  Thiruvonam: 'Magaram', Avittam: 'Kumbam', Sathayam: 'Kumbam',
  Poorattathi: 'Meenam', Uthirattathi: 'Meenam', Revathi: 'Meenam',
};

/**
 * Ganam (Temperament) classification
 */
const STAR_GANAM = {
  Ashwini: 'Deva', Bharani: 'Manushya', Karthigai: 'Rakshasa',
  Rohini: 'Manushya', Mrigashirsha: 'Deva', Thiruvathirai: 'Manushya',
  Punarpoosam: 'Deva', Poosam: 'Deva', Ayilyam: 'Rakshasa',
  Magam: 'Rakshasa', Pooram: 'Manushya', Uthiram: 'Manushya',
  Hastham: 'Deva', Chithirai: 'Rakshasa', Swathi: 'Deva',
  Visakam: 'Rakshasa', Anusham: 'Deva', Kettai: 'Rakshasa',
  Moolam: 'Rakshasa', Pooradam: 'Manushya', Uthiradam: 'Manushya',
  Thiruvonam: 'Deva', Avittam: 'Manushya', Sathayam: 'Rakshasa',
  Poorattathi: 'Manushya', Uthirattathi: 'Manushya', Revathi: 'Deva',
};

/**
 * Yoni (Animal) classification
 */
const STAR_YONI = {
  Ashwini: 'Horse', Bharani: 'Elephant', Karthigai: 'Goat',
  Rohini: 'Snake', Mrigashirsha: 'Snake', Thiruvathirai: 'Dog',
  Punarpoosam: 'Cat', Poosam: 'Goat', Ayilyam: 'Cat',
  Magam: 'Rat', Pooram: 'Cow', Uthiram: 'Cow',
  Hastham: 'Buffalo', Chithirai: 'Tiger', Swathi: 'Buffalo',
  Visakam: 'Tiger', Anusham: 'Deer', Kettai: 'Deer',
  Moolam: 'Dog', Pooradam: 'Monkey', Uthiradam: 'Mongoose',
  Thiruvonam: 'Monkey', Avittam: 'Lion', Sathayam: 'Horse',
  Poorattathi: 'Lion', Uthirattathi: 'Elephant', Revathi: 'Elephant',
};

/**
 * Rajju classification for longevity check
 */
const STAR_RAJJU = {
  Ashwini: 'Pada', Bharani: 'Kati', Karthigai: 'Nabhi',
  Rohini: 'Kanta', Mrigashirsha: 'Siro', Thiruvathirai: 'Kanta',
  Punarpoosam: 'Nabhi', Poosam: 'Kati', Ayilyam: 'Pada',
  Magam: 'Pada', Pooram: 'Kati', Uthiram: 'Nabhi',
  Hastham: 'Kanta', Chithirai: 'Siro', Swathi: 'Kanta',
  Visakam: 'Nabhi', Anusham: 'Kati', Kettai: 'Pada',
  Moolam: 'Pada', Pooradam: 'Kati', Uthiradam: 'Nabhi',
  Thiruvonam: 'Kanta', Avittam: 'Siro', Sathayam: 'Kanta',
  Poorattathi: 'Nabhi', Uthirattathi: 'Kati', Revathi: 'Pada',
};

/**
 * Calculate 10-Porutham compatibility
 * @param {string} boyStarName - Boy's nakshatra
 * @param {string} girlStarName - Girl's nakshatra
 * @returns {object} Detailed compatibility result
 */
export const calculateStarCompatibility = (boyStarName, girlStarName) => {
  if (!boyStarName || !girlStarName) {
    return { total: 0, maxScore: 10, percentage: 0, details: [] };
  }

  const boyIdx = STAR_INDEX[boyStarName];
  const girlIdx = STAR_INDEX[girlStarName];

  if (boyIdx === undefined || girlIdx === undefined) {
    return { total: 0, maxScore: 10, percentage: 0, details: [] };
  }

  const details = [];
  let total = 0;

  // 1. Dinam (Day star) - Count from girl to boy should be favorable
  const dinamCount = ((boyIdx - girlIdx + 27) % 27) + 1;
  const dinamMatch = ![2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 22, 24, 26].includes(dinamCount);
  if (dinamMatch) total++;
  details.push({ name: 'Dinam (தினம்)', matched: dinamMatch, description: 'Daily harmony' });

  // 2. Ganam (Temperament)
  const boyGanam = STAR_GANAM[boyStarName];
  const girlGanam = STAR_GANAM[girlStarName];
  const ganamMatch = boyGanam === girlGanam ||
    (boyGanam === 'Deva' && girlGanam === 'Manushya') ||
    (boyGanam === 'Manushya' && girlGanam === 'Deva');
  if (ganamMatch) total++;
  details.push({ name: 'Ganam (கணம்)', matched: ganamMatch, description: 'Temperament match' });

  // 3. Mahendram
  const mahendramCount = ((boyIdx - girlIdx + 27) % 27) + 1;
  const mahendramMatch = [4, 7, 10, 13, 16, 19, 22, 25].includes(mahendramCount);
  if (mahendramMatch) total++;
  details.push({ name: 'Mahendram (மகேந்திரம்)', matched: mahendramMatch, description: 'Prosperity' });

  // 4. Stree Deergham (Female longevity)
  const streeCount = ((boyIdx - girlIdx + 27) % 27) + 1;
  const streeMatch = streeCount >= 14;
  if (streeMatch) total++;
  details.push({ name: 'Stree Deergham (ஸ்திரீ தீர்க்கம்)', matched: streeMatch, description: 'Female wellbeing' });

  // 5. Yoni (Animal compatibility)
  const boyYoni = STAR_YONI[boyStarName];
  const girlYoni = STAR_YONI[girlStarName];
  const yoniMatch = boyYoni === girlYoni;
  if (yoniMatch) total++;
  details.push({ name: 'Yoni (யோனி)', matched: yoniMatch, description: 'Physical compatibility' });

  // 6. Rasi (Moon sign)
  const boyRaasi = STAR_TO_RAASI[boyStarName];
  const girlRaasi = STAR_TO_RAASI[girlStarName];
  const rasiMatch = boyRaasi === girlRaasi || areFriendlyRaasis(boyRaasi, girlRaasi);
  if (rasiMatch) total++;
  details.push({ name: 'Rasi (ராசி)', matched: rasiMatch, description: 'Mental compatibility' });

  // 7. Rasiyathipathi (Rasi lord)
  const rasiLordMatch = areFriendlyRasiLords(boyRaasi, girlRaasi);
  if (rasiLordMatch) total++;
  details.push({ name: 'Rasiyathipathi (ராசியாதிபதி)', matched: rasiLordMatch, description: 'Lord compatibility' });

  // 8. Vasiyam (Attraction)
  const vasiyamMatch = checkVasiyam(boyRaasi, girlRaasi);
  if (vasiyamMatch) total++;
  details.push({ name: 'Vasiyam (வசியம்)', matched: vasiyamMatch, description: 'Mutual attraction' });

  // 9. Rajju (Longevity)
  const boyRajju = STAR_RAJJU[boyStarName];
  const girlRajju = STAR_RAJJU[girlStarName];
  const rajjuMatch = boyRajju !== girlRajju;
  if (rajjuMatch) total++;
  details.push({ name: 'Rajju (ரஜ்ஜு)', matched: rajjuMatch, description: 'Longevity of marriage' });

  // 10. Vedhai (Opposition)
  const vedhaiMatch = !checkVedhai(boyStarName, girlStarName);
  if (vedhaiMatch) total++;
  details.push({ name: 'Vedhai (வேதை)', matched: vedhaiMatch, description: 'No opposition' });

  const percentage = Math.round((total / 10) * 100);

  return {
    total,
    maxScore: 10,
    percentage,
    details,
    verdict: total >= 7 ? 'Excellent' : total >= 5 ? 'Good' : total >= 3 ? 'Average' : 'Low',
  };
};

// Helper: Check friendly raasis
const areFriendlyRaasis = (raasi1, raasi2) => {
  const friendly = {
    Mesham: ['Simmam', 'Dhanusu'],
    Rishabam: ['Kanni', 'Magaram'],
    Mithunam: ['Thulam', 'Kumbam'],
    Kadagam: ['Viruchigam', 'Meenam'],
    Simmam: ['Mesham', 'Dhanusu'],
    Kanni: ['Rishabam', 'Magaram'],
    Thulam: ['Mithunam', 'Kumbam'],
    Viruchigam: ['Kadagam', 'Meenam'],
    Dhanusu: ['Mesham', 'Simmam'],
    Magaram: ['Rishabam', 'Kanni'],
    Kumbam: ['Mithunam', 'Thulam'],
    Meenam: ['Kadagam', 'Viruchigam'],
  };
  return friendly[raasi1]?.includes(raasi2) || false;
};

// Helper: Check friendly rasi lords
const areFriendlyRasiLords = (raasi1, raasi2) => {
  return areFriendlyRaasis(raasi1, raasi2) || raasi1 === raasi2;
};

// Helper: Check Vasiyam
const checkVasiyam = (raasi1, raasi2) => {
  const vasiyam = {
    Mesham: ['Simmam', 'Viruchigam'],
    Rishabam: ['Kadagam', 'Thulam'],
    Mithunam: ['Kanni'],
    Kadagam: ['Viruchigam', 'Dhanusu'],
    Simmam: ['Thulam'],
    Kanni: ['Meenam', 'Mithunam'],
    Thulam: ['Magaram', 'Rishabam'],
    Viruchigam: ['Kadagam'],
    Dhanusu: ['Meenam'],
    Magaram: ['Mesham', 'Kumbam'],
    Kumbam: ['Mesham'],
    Meenam: ['Magaram'],
  };
  return vasiyam[raasi1]?.includes(raasi2) || vasiyam[raasi2]?.includes(raasi1) || false;
};

// Helper: Check Vedhai (opposition)
const checkVedhai = (star1, star2) => {
  const vedhaiPairs = [
    ['Ashwini', 'Kettai'], ['Bharani', 'Anusham'],
    ['Karthigai', 'Visakam'], ['Rohini', 'Swathi'],
    ['Thiruvathirai', 'Thiruvonam'], ['Punarpoosam', 'Uthiradam'],
    ['Poosam', 'Pooradam'], ['Ayilyam', 'Moolam'],
    ['Magam', 'Revathi'], ['Pooram', 'Uthirattathi'],
    ['Uthiram', 'Poorattathi'], ['Hastham', 'Sathayam'],
    ['Chithirai', 'Avittam'],
  ];
  return vedhaiPairs.some(
    ([a, b]) => (star1 === a && star2 === b) || (star1 === b && star2 === a)
  );
};

export default calculateStarCompatibility;
