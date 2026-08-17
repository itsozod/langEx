import { apiRequest } from '@/shared/lib/api-client';

import type { DiscoverResponse, ProficiencyLevel, PublicUserResponse } from './types';

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
