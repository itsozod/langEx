import type { AuthUser } from '@/screens/auth/types';
import { apiRequest } from '@/shared/lib/api-client';

import type { EditProfileFormValues } from './schemas';

type UserResponse = {
  user: AuthUser;
};

export function updateProfile(values: EditProfileFormValues) {
  return apiRequest<UserResponse>('/users/profile', {
    method: 'PUT',
    body: values,
  });
}

export function removeAvatar() {
  return apiRequest<UserResponse>('/users/avatar', {
    method: 'DELETE',
  });
}
