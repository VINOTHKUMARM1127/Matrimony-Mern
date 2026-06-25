/**
 * Wedring Matrimony Web — Axios API Client
 * Replaces Supabase SDK for backend communication.
 */
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response.data?.data || response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      const store = useAuthStore.getState();
      if (store.logout) store.logout();
    }
    const errorMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
