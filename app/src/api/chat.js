/**
 * Wedring Matrimony — Chat API
 * Messaging functions (Realtime removed pending backend WebSocket implementation)
 */
import apiClient from './apiClient';

/**
 * Get user's chat list
 */
export const getChatList = async (userId) => {
  try {
    const data = await apiClient.get('/chat');
    return data;
  } catch (err) {
    return [];
  }
};

/**
 * Get messages for a chat
 */
export const getMessages = async (chatId, limit = 50, before = null) => {
  try {
    const data = await apiClient.get(`/chat/${chatId}/messages`, { params: { limit, before } });
    return data;
  } catch (err) {
    return [];
  }
};

/**
 * Send a message
 */
export const sendMessage = async (chatId, senderId, content, messageType = 'text') => {
  try {
    const data = await apiClient.post(`/chat/${chatId}/messages`, {
      content,
      message_type: messageType,
    });
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Create or get existing chat between two users
 */
export const createChat = async (userId1, userId2) => {
  try {
    const data = await apiClient.post('/chat', { targetUserId: userId2 });
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesRead = async (chatId, userId) => {
  try {
    await apiClient.put(`/chat/${chatId}/read`);
  } catch (err) {}
};

/**
 * Subscribe to new messages in a chat (Realtime mock)
 */
export const subscribeToMessages = (chatId, callback) => {
  // Realtime subscription not implemented on REST API.
  // Requires WebSocket or SSE on the backend.
  console.warn('Realtime chat subscription requires WebSocket backend implementation.');
  
  // Return a dummy unsubscribe function
  return {
    unsubscribe: () => {}
  };
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (userId) => {
  try {
    const data = await apiClient.get('/chat/unread-count');
    return data.count || 0;
  } catch (err) {
    return 0;
  }
};
