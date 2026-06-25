/**
 * Wedring Matrimony — Profile Store (Zustand)
 * User profile state management
 */
import { create } from 'zustand';
import * as profilesApi from '../api/profiles';

const useProfileStore = create((set, get) => ({
  // State
  profile: null,
  partnerPreferences: null,
  horoscope: null,
  photos: [],
  user_memberships: [],
  familyDetails: null,
  isProfileLoaded: false,
  isProfileComplete: false,
  registrationStep: 0,
  isLoading: false,
  error: null,

  // Actions
  setProfile: (profile) => set({
    profile,
    isProfileComplete: (profile?.profile_completion || 0) > 0,
    isProfileLoaded: true,
  }),

  setRegistrationStep: (step) => set({ registrationStep: step }),

  /**
   * Load current user's full profile
   */
  loadProfile: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const data = await profilesApi.getMyProfile(userId);
      set({
        profile: data,
        partnerPreferences: data?.partner_preferences,
        horoscope: data?.horoscope_details,
        photos: data?.profile_photos || [],
        user_memberships: data?.user_memberships || [],
        familyDetails: data?.family_details,
        isProfileComplete: (data?.profile_completion || 0) > 0,
        isProfileLoaded: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      console.warn('Profile load error:', error);

      // No mock-profile fallback: faking a profile here hid real auth/RLS
      // failures. Surface the error and let the UI route to login/retry while
      // ensuring we never get stuck on the splash screen.
      set({
        profile: null,
        isProfileComplete: false,
        isProfileLoaded: true,
        isLoading: false,
        error: error.message,
      });
      return null;
    }
  },

  /**
   * Save/update profile data
   */
  saveProfile: async (profileData) => {
    try {
      set({ isLoading: true, error: null });
      const currentProfile = get().profile || {};
      const mergedData = {
        ...currentProfile,
        ...profileData,
      };

      // Strip relational fields that aren't actual columns on the public.profiles table
      const {
        horoscope_details,
        partner_preferences,
        profile_photos,
        profile_created_for,
        user_memberships, // Strip this out to prevent Postgres error
        family_details,
        ...profileDbFields
      } = mergedData;

      // No silent fallback: a DB failure must surface so the user/UI knows the
      // save did not persist (previously this swallowed errors in dev).
      const data = await profilesApi.upsertProfile(profileDbFields);

      set((state) => ({
        profile: { ...state.profile, ...mergedData, ...data },
        isProfileComplete: (data?.profile_completion || 0) > 0,
        isLoading: false,
      }));
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Update specific profile fields
   */
  updateProfile: async (userId, updates) => {
    try {
      set({ isLoading: true, error: null });
      // No silent fallback — surface DB errors instead of faking success.
      const data = await profilesApi.updateProfile(userId, updates);
      set((state) => ({
        profile: { ...state.profile, ...data },
        isProfileComplete: (data?.profile_completion || 0) > 0,
        isLoading: false,
      }));
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Save horoscope details
   */
  saveHoroscope: async (horoscopeData) => {
    try {
      set({ isLoading: true, error: null });
      // No silent fallback — a failed horoscope save must surface.
      const data = await profilesApi.upsertHoroscope(horoscopeData);
      set({ horoscope: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Save partner preferences
   */
  savePartnerPreferences: async (prefData) => {
    try {
      set({ isLoading: true, error: null });
      // No silent fallback — a failed preferences save must surface.
      const data = await profilesApi.upsertPartnerPreferences(prefData);
      set({ partnerPreferences: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Save family details
   */
  saveFamilyDetails: async (familyData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await profilesApi.upsertFamilyDetails(familyData);
      set({ familyDetails: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Add photo to local state
   */
  addPhoto: (photo) => set((state) => ({
    photos: [...state.photos, photo],
  })),

  /**
   * Replace or set primary photo
   */
  replacePrimaryPhoto: (newPhoto) => set((state) => {
    const existingIndex = state.photos.findIndex(p => p.id === newPhoto.id || p.is_primary);
    let newPhotos = [...state.photos];
    
    // Ensure all other photos are not primary
    newPhotos = newPhotos.map(p => ({ ...p, is_primary: false }));

    if (existingIndex >= 0) {
      newPhotos[existingIndex] = { ...newPhoto, is_primary: true };
    } else {
      newPhotos.push({ ...newPhoto, is_primary: true });
    }

    return { photos: newPhotos };
  }),

  /**
   * Remove photo from local state
   */
  removePhoto: (photoId) => set((state) => ({
    photos: state.photos.filter((p) => p.id !== photoId),
  })),

  /**
   * Set primary photo
   */
  setPrimaryPhoto: (photoId) => set((state) => ({
    photos: state.photos.map((p) => ({
      ...p,
      is_primary: p.id === photoId,
    })),
  })),

  /**
   * Reset store
   */
  reset: () => set({
    profile: null,
    partnerPreferences: null,
    horoscope: null,
    photos: [],
    user_memberships: [],
    familyDetails: null,
    isProfileLoaded: false,
    isProfileComplete: false,
    registrationStep: 0,
    isLoading: false,
    error: null,
  }),
}));

export default useProfileStore;
