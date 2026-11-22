import { apiRequest, authApiRequest } from '@/shared/lib/api-client';

import type {
  AuthCredentials,
  AuthResponse,
  GoogleAuthCredentials,
  MeResponse,
  PasswordResetConfirmation,
  PasswordResetConfirmationResponse,
  PasswordResetRequest,
  PasswordResetRequestResponse,
  RegistrationConfirmation,
  RegistrationVerificationRequest,
  RegistrationVerificationResponse,
} from './types';

export const requestRegistrationVerification = (request: RegistrationVerificationRequest) =>
  authApiRequest<RegistrationVerificationResponse>('/auth/registration/request', {
    method: 'POST',
    body: request,
  });

export const confirmRegistration = (confirmation: RegistrationConfirmation) =>
  authApiRequest<AuthResponse>('/auth/registration/confirm', {
    method: 'POST',
    body: confirmation,
  });

export const login = (credentials: AuthCredentials) =>
  authApiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  });

export const authenticateWithGoogle = (credentials: GoogleAuthCredentials) =>
  authApiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: credentials,
  });

export const requestPasswordReset = (request: PasswordResetRequest) =>
  authApiRequest<PasswordResetRequestResponse>('/auth/password-reset/request', {
    method: 'POST',
    body: request,
  });

export const confirmPasswordReset = (confirmation: PasswordResetConfirmation) =>
  authApiRequest<PasswordResetConfirmationResponse>('/auth/password-reset/confirm', {
    method: 'POST',
    body: confirmation,
  });

export const getMe = () => apiRequest<MeResponse>('/me');
