import { apiRequest, authApiRequest } from '@/shared/lib/api-client';

import type { AuthCredentials, AuthResponse, MeResponse, RegisterCredentials } from './types';

export const register = (credentials: RegisterCredentials) =>
  authApiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: credentials,
  });

export const login = (credentials: AuthCredentials) =>
  authApiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  });

export const getMe = () => apiRequest<MeResponse>('/me');
