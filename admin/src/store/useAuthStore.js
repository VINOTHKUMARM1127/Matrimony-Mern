import { create } from 'zustand';
import apiClient from '../api/apiClient';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  initialize: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Fetch current user details from backend using the token
        // We'll use the getOwnProfile endpoint as it validates the token and returns the user
        const res = await apiClient.get('/profile');
        set({
          user: res.data || res,
          isAuthenticated: true,
          isInitializing: false,
        });
      } else {
        set({ isInitializing: false });
      }
    } catch (error) {
      console.error('Auth initialization failed', error);
      // Remove invalid token
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ isInitializing: false, isAuthenticated: false, user: null });
    }
  },

  signIn: async (email, password) => {
    const data = await apiClient.post('/auth/login/email', { email, password });
    
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  signOut: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed', err);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
