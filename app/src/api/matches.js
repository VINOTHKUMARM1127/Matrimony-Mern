/**
 * Wedring Matrimony — Matches API
 * Profile matching and recommendation queries
 */
import apiClient from './apiClient';

/**
 * Get all matches based on backend distribution pool
 */
export const getAllMatches = async (userId, limit = 20, offset = 0) => {
  try {
    const data = await apiClient.get('/matches/all-matches', { params: { limit, offset } });
    return data;
  } catch (err) {
    console.warn('API Error fetching all matches:', err);
    return [];
  }
};

/**
 * Get daily match updates based on backend distribution pool
 */
export const getDailyUpdates = async (userId, dailyLimit = 5, offset = 0) => {
  try {
    const data = await apiClient.get('/matches/daily-updates', { params: { limit: dailyLimit, offset } });
    return data;
  } catch (err) {
    console.warn('API Error fetching daily updates:', err);
    return [];
  }
};

/**
 * Get nearby profiles based on backend distribution pool
 */
export const getNearbyProfiles = async (userId, limit = 20, offset = 0) => {
  try {
    const data = await apiClient.get('/matches/nearby', { params: { limit, offset } });
    return data;
  } catch (err) {
    console.warn('API Error fetching nearby profiles:', err);
    return [];
  }
};

/**
 * Calculate compatibility between two profiles
 */
export const getCompatibilityScore = async (userId1, userId2) => {
  // Compatibility is usually calculated on the backend during distribution fetch.
  // If a dedicated endpoint is needed, it should be added to the backend.
  // For now, we return a default score.
  return 50;
};
