/**
 * Wedring Matrimony App — Axios API Client
 * Replaces Supabase SDK for backend communication.
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// We don't import useAuthStore here directly to avoid circular dependencies if useAuthStore imports this
// But we can import the logout action or just clear storage and emit an event

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('AsyncStorage get error in apiClient:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response.data?.data || response.data,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout
      try {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        // We could emit a custom event here, or rely on the components making the API call 
        // to handle the 401 and call logout() from the store.
      } catch (e) {}
    }
    const errorMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
