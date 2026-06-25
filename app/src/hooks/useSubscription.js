/**
 * Wedring Matrimony — useSubscription Hook
 * React hook interface for subscriptions, history and feature check queries
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as subApi from '../api/subscriptions';
import useAuthStore from '../store/useAuthStore';
import useProfileStore from '../store/useProfileStore';

export const useSubscription = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const loadProfile = useProfileStore((s) => s.loadProfile);

  // Active subscription query
  const {
    data: activeSub,
    isLoading: loadingActiveSub,
    refetch: refetchActiveSub,
  } = useQuery({
    queryKey: ['activeSubscription', user?.id],
    queryFn: () => subApi.getActiveSubscription(user?.id),
    enabled: !!user?.id,
  });

  // History query
  const {
    data: subHistory,
    isLoading: loadingHistory,
  } = useQuery({
    queryKey: ['subscriptionHistory', user?.id],
    queryFn: () => subApi.getSubscriptionHistory(user?.id),
    enabled: !!user?.id,
  });

  // Create subscription mutation
  const createSubMutation = useMutation({
    mutationFn: (subData) => subApi.createSubscription({ ...subData, user_id: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSubscription', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionHistory', user?.id] });
      if (user?.id) {
        loadProfile(user.id);
      }
    },
  });

  // Check feature permission helper
  const checkPermission = async (feature) => {
    if (!user?.id) return false;
    return subApi.checkPremiumAccess(user.id, feature);
  };

  return {
    activeSub,
    isPremium: !!activeSub,
    loadingActiveSub,
    refetchActiveSub,
    subHistory,
    loadingHistory,
    createSubscription: createSubMutation.mutateAsync,
    isSubscribing: createSubMutation.isPending,
    checkPermission,
  };
};

export default useSubscription;
