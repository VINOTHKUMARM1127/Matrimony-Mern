/**
 * Wedring Matrimony — useProfile Hook
 * React hook interface for profile operations, editing and detail loading
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useProfileStore from '../store/useProfileStore';
import * as profilesApi from '../api/profiles';

export const useProfile = (profileId) => {
  const queryClient = useQueryClient();
  const myProfile = useProfileStore((s) => s.profile);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const saveHoroscope = useProfileStore((s) => s.saveHoroscope);
  const savePartnerPreferences = useProfileStore((s) => s.savePartnerPreferences);

  // Fetch detailed public profile for a specific user
  const {
    data: profileDetail,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => profilesApi.getProfile(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Mutation for updating profile fields
  const updateMutation = useMutation({
    mutationFn: ({ userId, updates }) => updateProfile(userId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
      queryClient.invalidateQueries({ queryKey: ['recommended'] });
    },
  });

  return {
    myProfile,
    profileDetail,
    isProfileLoading,
    profileError,
    refetchProfile,
    saveProfile,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    saveHoroscope,
    savePartnerPreferences,
  };
};

export default useProfile;
