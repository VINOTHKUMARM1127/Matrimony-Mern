/**
 * Wedring Matrimony — Profiles API
 * Profile CRUD operations via Node Backend
 */
import apiClient from './apiClient';
import { PAGE_SIZE } from '../utils/constants';

/**
 * Get current user's profile
 */
export const getMyProfile = async (userId) => {
  // Backend relies on JWT token for the current user's profile
  const data = await apiClient.get('/profile');
  return data;
};

/**
 * Get a user's public profile
 */
export const getProfile = async (profileId) => {
  const data = await apiClient.get(`/profile/${profileId}`);
  return data;
};

/**
 * Create or update generic profile
 */
export const upsertProfile = async (profileData) => {
  const data = await apiClient.patch('/profile', profileData);
  return data;
};

/**
 * Update generic profile fields
 */
export const updateProfile = async (userId, updates) => {
  const data = await apiClient.patch('/profile', updates);
  return data;
};

/**
 * Upsert horoscope details
 */
export const upsertHoroscope = async (horoscopeData) => {
  const data = await apiClient.post('/profile/horoscope', horoscopeData);
  return data;
};

/**
 * Upsert partner preferences
 */
export const upsertPartnerPreferences = async (prefData) => {
  const data = await apiClient.post('/profile/partner-preferences', prefData);
  return data;
};

/**
 * Upsert family details
 */
export const upsertFamilyDetails = async (familyData) => {
  const data = await apiClient.post('/profile/family-location', familyData);
  return data;
};

/**
 * Search/filter profiles with pagination (Advanced Search)
 */
export const searchProfiles = async (filters = {}, page = 0) => {
  const params = {
    ...filters,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };
  const data = await apiClient.get('/profile/search', { params });
  return { 
    profiles: data.profiles || [], 
    total: data.total, 
    page, 
    hasMore: (page + 1) * PAGE_SIZE < data.total 
  };
};

/**
 * Update last active timestamp
 */
export const updateLastActive = async (userId) => {
  try {
    await apiClient.put('/profile/active');
  } catch (err) {
    console.warn('Failed to update last active:', err);
  }
};

/**
 * Log profile view activity
 */
export const logProfileView = async (viewerId, viewedId) => {
  try {
    await apiClient.post(`/profile/${viewedId}/view`);
  } catch (err) {
    console.warn('Failed to log profile view:', err);
  }
};

/**
 * Deactivate profile
 */
export const deactivateProfile = async (userId) => {
  // Depending on what deactivated means, might need an explicit route. We'll use PATCH for now.
  const data = await apiClient.patch('/profile', { is_active: false });
  return data;
};

/**
 * Upload a profile photo with compression and update the database
 */
export const uploadProfilePhoto = async (userId, fileUri, options = { replacePrimary: true, isPrimary: true }) => {
  try {
    const ImageManipulator = await import('expo-image-manipulator');
    const FileSystem = await import('expo-file-system');

    let quality = 0.8;
    let width = 1080;
    let manipResult;
    let fileSize = Infinity;

    while (fileSize > 200 * 1024 && quality > 0.1) {
      manipResult = await ImageManipulator.manipulateAsync(
        fileUri,
        [{ resize: { width } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );
      const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);
      fileSize = fileInfo.size;
      quality -= 0.15;
      width = Math.floor(width * 0.8);
    }

    const formData = new FormData();
    formData.append('photo', {
      uri: manipResult.uri,
      name: `${Date.now()}.jpg`,
      type: 'image/jpeg',
    });

    const data = await apiClient.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (options.replacePrimary || options.isPrimary) {
      await apiClient.put(`/photos/${data.id}/primary`);
    }

    return data;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

/**
 * Set a specific photo as primary
 */
export const setPrimaryProfilePhoto = async (userId, photoId) => {
  try {
    const data = await apiClient.put(`/photos/${photoId}/primary`);
    return data;
  } catch (error) {
    console.error('Error setting primary photo:', error);
    throw error;
  }
};

/**
 * Delete a profile photo
 */
export const deleteProfilePhoto = async (photoId, storagePath) => {
  try {
    await apiClient.delete(`/photos/${photoId}`);
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};
