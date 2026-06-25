/**
 * Wedring Matrimony — Interests API
 * Send, receive, accept/decline interest requests
 */
import apiClient from './apiClient';

/**
 * Send interest to a user securely via backend RPC
 */
export const sendInterest = async (senderId, receiverId, message = '') => {
  const data = await apiClient.post(`/interests/send/${receiverId}`, { message });
  return data;
};

/**
 * Get received interests
 */
export const getReceivedInterests = async (userId, status = 'pending') => {
  // Assuming the backend returns all and we filter, or backend supports ?status=...
  const data = await apiClient.get('/interests/received');
  return data.filter(item => item.status === status);
};

/**
 * Get sent interests
 */
export const getSentInterests = async (userId) => {
  const data = await apiClient.get('/interests/sent');
  return data.filter(item => item.status !== 'declined' && item.status !== 'rejected');
};

/**
 * Accept interest
 */
export const acceptInterest = async (interestId) => {
  const data = await apiClient.put(`/interests/${interestId}/accept`);
  return data;
};

/**
 * Decline interest
 */
export const declineInterest = async (interestId) => {
  const data = await apiClient.put(`/interests/${interestId}/reject`);
  return data;
};

/**
 * Check if interest already sent
 */
export const checkInterestStatus = async (senderId, receiverId) => {
  try {
    const data = await apiClient.get(`/interests/status/${receiverId}`);
    return data;
  } catch (err) {
    return null;
  }
};

/**
 * Pass on a profile (Not Interested)
 */
export const passProfile = async (senderId, receiverId) => {
  const data = await apiClient.post(`/interests/not-interested/${receiverId}`);
  return data;
};

/**
 * Get passed profiles (Not Interested)
 */
export const getPassedProfiles = async (userId) => {
  const data = await apiClient.get('/interests/not-interested');
  return data;
};

/**
 * Restore a passed profile
 */
export const restorePassedProfile = async (targetUserId) => {
  // In the old API it was notInterestedId, but backend expects targetUserId
  const data = await apiClient.delete(`/interests/not-interested/${targetUserId}`);
  return data;
};

/**
 * Get all profile IDs the user has interacted with (sent, received, passed)
 */
export const getUserInteractions = async (userId) => {
  // Not used in app, return empty array
  return [];
};

/**
 * View contact details with quota check
 */
export const viewContact = async (viewerId, targetId) => {
  const data = await apiClient.post(`/credits/deduct/contact/${targetId}`);
  return data;
};
