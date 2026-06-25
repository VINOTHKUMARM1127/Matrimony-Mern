/**
 * Wedring Matrimony — useSearch Hook
 * Manages search state, filters, and coordinates API calling
 */
import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import * as profilesApi from '../api/profiles';
import useAuthStore from '../store/useAuthStore';
import useProfileStore from '../store/useProfileStore';

export const useSearch = (initialFilters = {}) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);

  const defaultFilters = {
    gender: profile?.gender === 'male' ? 'female' : 'male',
    sortBy: 'recent',
    ...initialFilters,
  };

  const [filters, setFilters] = useState(defaultFilters);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['search', JSON.stringify(filters)],
    queryFn: ({ pageParam = 0 }) =>
      profilesApi.searchProfiles({ ...filters, excludeUserId: user?.id }, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!user?.id,
  });

  const profiles = useMemo(() => {
    const raw = data?.pages?.flatMap((p) => p.profiles) || [];
    const seen = new Set();
    return raw.filter((item) => {
      if (!item?.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);
  const totalCount = data?.pages?.[0]?.total || 0;

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [profile]);

  return {
    profiles,
    totalCount,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};

export default useSearch;
