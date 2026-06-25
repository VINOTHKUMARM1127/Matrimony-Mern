/**
 * Wedring Matrimony — useMatches Hook
 * Fetch All Matches and Daily Updates from the user's profile pool
 */
import React from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import * as matchesApi from '../api/matches';
import useAuthStore from '../store/useAuthStore';
import useProfileStore from '../store/useProfileStore';
import * as subApi from '../api/subscriptions';

const PAGE_SIZE = 10;

export const useMatches = () => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);

  const { data: activeSub } = useQuery({
    queryKey: ['activeSubscription', user?.id],
    queryFn: () => subApi.getActiveSubscription(user?.id),
    enabled: !!user?.id,
  });

  const isPremium = profile?.is_premium || !!activeSub;

  // All Matches query (Infinite)
  const {
    data: allMatchesData,
    isLoading: loadingAllMatches,
    fetchNextPage: fetchNextAllMatches,
    hasNextPage: hasNextAllMatches,
    isFetchingNextPage: fetchingNextAllMatches,
    refetch: refetchAllMatches,
  } = useInfiniteQuery({
    queryKey: ['allMatches', user?.id],
    queryFn: ({ pageParam = 0 }) => matchesApi.getAllMatches(user?.id, PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.length, 0);
      if (lastPage.length < PAGE_SIZE) return undefined;
      return totalFetched;
    },
    enabled: !!user?.id,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  // Daily Updates query (Infinite)
  const {
    data: dailyUpdatesData,
    isLoading: loadingDailyUpdates,
    fetchNextPage: fetchNextDailyUpdates,
    hasNextPage: hasNextDailyUpdates,
    isFetchingNextPage: fetchingNextDailyUpdates,
    refetch: refetchDailyUpdates,
  } = useInfiniteQuery({
    queryKey: ['dailyUpdates', user?.id],
    queryFn: ({ pageParam = 0 }) => matchesApi.getDailyUpdates(user?.id, PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.length, 0);
      if (lastPage.length < PAGE_SIZE) return undefined;
      return totalFetched;
    },
    enabled: !!user?.id,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  // Nearby Matches query (Infinite)
  const {
    data: nearbyMatchesData,
    isLoading: loadingNearbyMatches,
    fetchNextPage: fetchNextNearbyMatches,
    hasNextPage: hasNextNearbyMatches,
    isFetchingNextPage: fetchingNextNearbyMatches,
    refetch: refetchNearbyMatches,
  } = useInfiniteQuery({
    queryKey: ['nearbyMatches', user?.id],
    queryFn: ({ pageParam = 0 }) => matchesApi.getNearbyProfiles(user?.id, PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.length, 0);
      if (lastPage.length < PAGE_SIZE) return undefined;
      return totalFetched;
    },
    enabled: !!user?.id,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const deduplicate = (arr) => {
    const seen = new Set();
    return arr.filter(item => {
      if (!item?.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const recommended = React.useMemo(() => deduplicate(allMatchesData?.pages?.flat() || []), [allMatchesData]);
  const dailyMatches = React.useMemo(() => deduplicate(dailyUpdatesData?.pages?.flat() || []), [dailyUpdatesData]);
  const nearbyMatches = React.useMemo(() => deduplicate(nearbyMatchesData?.pages?.flat() || []), [nearbyMatchesData]);

  return {
    recommended,
    loadingRecommended: loadingAllMatches,
    fetchNextRecommended: fetchNextAllMatches,
    hasNextRecommended: hasNextAllMatches,
    fetchingNextRecommended: fetchingNextAllMatches,
    refetchRecommended: refetchAllMatches,

    dailyMatches,
    loadingDaily: loadingDailyUpdates,
    fetchNextDaily: fetchNextDailyUpdates,
    hasNextDaily: hasNextDailyUpdates,
    fetchingNextDaily: fetchingNextDailyUpdates,
    refetchDaily: refetchDailyUpdates,

    nearbyMatches,
    loadingNearby: loadingNearbyMatches,
    fetchNextNearby: fetchNextNearbyMatches,
    hasNextNearby: hasNextNearbyMatches,
    fetchingNextNearby: fetchingNextNearbyMatches,
    refetchNearby: refetchNearbyMatches,
  };
};

export default useMatches;
