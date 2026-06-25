/**
 * Wedring Matrimony — Auth Store (Zustand)
 * Global authentication state management
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/auth';
import * as fast2sms from '../api/fast2sms';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  isOtpSent: false,
  error: null,
  pendingVerification: null,
  authListenerSubscription: null,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearPendingVerification: () => set({ pendingVerification: null }),

  /**
   * Initialize auth state - check for existing session
   */
  initialize: async () => {
    try {
      set({ isInitializing: true, error: null });

      const session = await authApi.getSession();
      if (session && session.user) {
        // Pre-fetch profile prior to resolving auth state
        try {
          const useProfileStore = require('./useProfileStore').default;
          await useProfileStore.getState().loadProfile(session.user.id);
        } catch (e) {
          console.warn('Profile load failed on init:', e);
        }

        set({
          user: session.user,
          session,
          isAuthenticated: true,
          isInitializing: false,
        });
      } else {
        set({ isInitializing: false });
      }
    } catch (error) {
      console.error('Auth init error:', error);
      set({ isInitializing: false, error: error.message });
    }
  },

  /**
   * Send OTP to phone number via Fast2SMS
   */
  sendOTP: async (phone) => {
    try {
      set({ isLoading: true, error: null, isOtpSent: false });
      await fast2sms.sendOTP(phone);
      set({ isLoading: false, isOtpSent: true });
      return true;
    } catch (error) {
      console.warn('[sendOTP] Fast2SMS error:', error.message);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  /**
   * Send OTP to email address
   */
  sendEmailOTP: async (email) => {
    try {
      set({ isLoading: true, error: null, isOtpSent: false });
      await authApi.signInWithEmailOtp(email);
      set({ isLoading: false, isOtpSent: true });
      return true;
    } catch (error) {
      if (__DEV__ || process.env.EXPO_PUBLIC_APP_ENV === 'development') {
        console.warn('Email OTP Provider error, using development mock bypass:', error.message);
        set({ isLoading: false, isOtpSent: true, error: null });
        return true;
      }
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  /**
   * Resend OTP code for signup email confirmation
   */
  resendSignupOTP: async (email) => {
    try {
      set({ isLoading: true, error: null });
      // The backend register/step1 essentially sends the OTP if called again, or we can add a resend endpoint.
      // For now, assume step1 handles resend if user exists but unverified.
      const data = await authApi.signUpWithPassword(email, 'Resend_Placeholder123!');
      set({ isLoading: false });
      return true;
    } catch (error) {
      if (__DEV__ || process.env.EXPO_PUBLIC_APP_ENV === 'development') {
        console.warn('Email Resend error, using development mock bypass:', error.message);
        set({ isLoading: false, error: null });
        return true;
      }
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  /**
   * Verify OTP code for phone via Fast2SMS (client-side verification)
   */
  verifyOTP: async (phone, otp) => {
    try {
      set({ isLoading: true, error: null });

      // Step 1: Verify OTP locally against Fast2SMS store
      fast2sms.verifyOTP(phone, otp);

      // Step 2: Call backend to verify and get token
      let data;
      try {
        data = await authApi.verifyOTP(phone, otp);
        if (data.access_token) {
          await AsyncStorage.setItem('access_token', data.access_token);
        }
        if (data.refresh_token) {
          await AsyncStorage.setItem('refresh_token', data.refresh_token);
        }
      } catch (backendError) {
        throw backendError;
      }

      // Pre-fetch profile prior to resolving auth state
      try {
        const useProfileStore = require('./useProfileStore').default;
        await useProfileStore.getState().loadProfile(data.user.id);
      } catch (e) {
        console.warn('Profile load failed during OTP verification:', e);
      }

      set({
        user: data.user,
        session: data,
        isAuthenticated: true,
        isLoading: false,
        isOtpSent: false,
        pendingVerification: null,
      });
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  /**
   * Verify OTP code for email
   */
  verifyEmailOTP: async (email, otp) => {
    try {
      set({ isLoading: true, error: null });
      const data = await authApi.verifyEmailOTP(email, otp);

      // Pre-fetch profile prior to resolving auth state
      try {
        const useProfileStore = require('./useProfileStore').default;
        await useProfileStore.getState().loadProfile(data.user.id);
      } catch (e) {
        console.warn('Profile load failed during email OTP verification:', e);
      }

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
        isOtpSent: false,
        pendingVerification: null,
      });
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  /**
   * Verify OTP code for signup email
   */
  verifySignupOTP: async (email, otp) => {
    try {
      set({ isLoading: true, error: null });
      const data = await authApi.verifySignupOTP(email, otp);

      if (data.access_token) {
        await AsyncStorage.setItem('access_token', data.access_token);
      }
      if (data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', data.refresh_token);
      }

      // Pre-fetch profile prior to resolving auth state
      try {
        const useProfileStore = require('./useProfileStore').default;
        await useProfileStore.getState().loadProfile(data.user.id);
      } catch (e) {
        console.warn('Profile load failed during signup OTP verification:', e);
      }

      set({
        user: data.user,
        session: data,
        isAuthenticated: true,
        isLoading: false,
        isOtpSent: false,
        pendingVerification: null,
      });
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  /**
   * Sign up with identifier and password
   */
  signUpWithPassword: async (identifier, password, profileData) => {
    try {
      set({ isLoading: true, error: null, pendingVerification: identifier });
      const data = await authApi.signUpWithPassword(identifier, password, profileData);

      // Save initial profile data locally
      try {
        if (data.user && profileData) {
          const useProfileStore = require('./useProfileStore').default;
          await useProfileStore.getState().saveProfile({
            id: data.user.id,
            display_name: profileData.name,
            profile_created_for: profileData.profileFor,
            gender: 'male', // default required field
            date_of_birth: '2000-01-01', // default required field
            mother_tongue: profileData.motherTongue || 'Tamil',
          });
        }
      } catch (e) {
        console.warn('Profile save failed during signup:', e);
      }

      // We force isAuthenticated to false here so the app NEVER jumps to the Basic Details page
      // before the OTP is entered. Even if Supabase returns a session, we trap them in the AuthStack.
      set({
        user: data.user,
        session: null, 
        isAuthenticated: false,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message, pendingVerification: null });
      return false;
    }
  },

  /**
   * Sign in with identifier and password
   */
  signInWithPassword: async (identifier, password) => {
    try {
      set({ isLoading: true, error: null, pendingVerification: null });
      const data = await authApi.signInWithPassword(identifier, password);

      if (data.access_token) {
        await AsyncStorage.setItem('access_token', data.access_token);
      }
      if (data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', data.refresh_token);
      }

      // Pre-fetch profile prior to resolving auth state
      try {
        const useProfileStore = require('./useProfileStore').default;
        await useProfileStore.getState().loadProfile(data.user.id);
      } catch (e) {
        console.warn('Profile load failed during password sign in:', e);
      }

      set({
        user: data.user,
        session: data,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      // Check if it's an unverified email error
      if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
        set({ 
          isLoading: false, 
          error: 'Email not verified. Please verify your OTP to continue.',
          pendingVerification: identifier 
        });
        return false;
      }
      
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    try {
      set({ isLoading: true });
      await authApi.signOut();
      
      try {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
      } catch (e) {}

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        isOtpSent: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.resetPassword(email);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  /**
   * Check if user exists by email or phone
   */
  checkUserExists: async (email, phone) => {
    try {
      set({ isLoading: true, error: null });
      const exists = await authApi.checkUserExists(email, phone);
      set({ isLoading: false });
      return exists;
    } catch (error) {
      console.warn('DB checkUserExists RPC failed, using development local fallback:', error.message);
      
      // Development mock fallback
      if (__DEV__ || process.env.EXPO_PUBLIC_APP_ENV === 'development') {
        const isMockEmail = /tamiluser\d+@matrimonydemo\.com/i.test(email || '');
        const isMockPhone = ['9876543210', '9999999999', '8888888888'].includes(phone?.replace(/[^0-9]/g, ''));
        
        set({ isLoading: false });
        return isMockEmail || isMockPhone;
      }
      
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
}));

export default useAuthStore;
