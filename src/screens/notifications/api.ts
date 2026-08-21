import { apiRequest } from '@/shared/lib/api-client';

export function savePushToken(token: string) {
  return apiRequest<void>('/users/push-token', {
    method: 'POST',
    body: { token },
  });
}
