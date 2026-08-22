import { apiRequest } from '@/shared/lib/api-client';

export function savePushToken(token: string) {
  return apiRequest<{ success: true }>('/users/push-token', {
    method: 'POST',
    body: { pushToken: token },
  });
}
