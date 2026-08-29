import { apiRequest } from '@/shared/lib/api-client';

import type {
  DiscoverResponse,
  ProficiencyLevel,
  PublicUserResponse,
  UserSearchResponse,
} from './types';

export const DISCOVER_PAGE_SIZE = 20;

export function getDiscoverUsers(page: number, proficiency?: ProficiencyLevel) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(DISCOVER_PAGE_SIZE),
  });

  if (proficiency) params.set('proficiency', proficiency);

  return apiRequest<DiscoverResponse>(`/discover?${params.toString()}`);
}

export function getPublicUser(id: string) {
  return apiRequest<PublicUserResponse>(`/users/${encodeURIComponent(id)}`);
}

export function searchUsers(query: string) {
  const params = new URLSearchParams({ q: query, limit: '20' });
  return apiRequest<UserSearchResponse>(`/users/search?${params.toString()}`);
}
