import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { useAuthStore } from '@/shared/store/auth-store';

import { getDiscoverUsers, getPublicUser, searchUsers } from './api';
import type { ProficiencyLevel } from './types';

export const discoverQueryKeys = {
  all: ['discover'] as const,
  list: (proficiency?: ProficiencyLevel) => ['discover', 'list', proficiency ?? 'all'] as const,
  user: (id: string) => ['discover', 'user', id] as const,
  search: (query: string) => ['discover', 'search', query] as const,
};

export function useDiscoverUsers(proficiency?: ProficiencyLevel) {
  const token = useAuthStore((state) => state.token);

  return useInfiniteQuery({
    queryKey: discoverQueryKeys.list(proficiency),
    queryFn: ({ pageParam }) => getDiscoverUsers(pageParam, proficiency),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
    enabled: Boolean(token),
  });
}

export function usePublicUser(id?: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: discoverQueryKeys.user(id ?? ''),
    queryFn: () => getPublicUser(id as string),
    enabled: Boolean(token && id),
  });
}

export function useUserSearch(query: string) {
  const token = useAuthStore((state) => state.token);
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, 300);

  return {
    debouncedQuery,
    query: useQuery({
      queryKey: discoverQueryKeys.search(debouncedQuery.toLocaleLowerCase()),
      queryFn: () => searchUsers(debouncedQuery),
      enabled: Boolean(token && debouncedQuery.length >= 2),
      // Keep the last results on screen while the next query loads, so the list never flashes.
      placeholderData: keepPreviousData,
      staleTime: 30_000,
    }),
  };
}
