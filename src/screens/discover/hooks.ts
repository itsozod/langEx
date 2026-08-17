import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/store/auth-store';

import { getDiscoverUsers, getPublicUser } from './api';
import type { ProficiencyLevel } from './types';

export const discoverQueryKeys = {
  all: ['discover'] as const,
  list: (proficiency?: ProficiencyLevel) => ['discover', 'list', proficiency ?? 'all'] as const,
  user: (id: string) => ['discover', 'user', id] as const,
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
