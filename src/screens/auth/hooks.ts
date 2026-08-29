import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/shared/lib/api-client';
import { useAuthStore } from '@/shared/store/auth-store';

import { activateAuthenticatedSession } from './_shared/utils/session-transition';
import { getMe, login, register } from './api';

export const authQueryKeys = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
};

const useAuthMutationSuccess = () => {
  const queryClient = useQueryClient();

  return async (data: Awaited<ReturnType<typeof login>>) => {
    await activateAuthenticatedSession(data.token, data.user);
    queryClient.setQueryData(authQueryKeys.me, { user: data.user });
  };
};

// A cold backend can reset the first connection instead of answering it, which Android's OkHttp
// surfaces immediately as a transport error. Retrying only status 0 recovers that without ever
// resubmitting credentials that the server actually rejected.
const retryUnreachable = (failureCount: number, error: Error) =>
  failureCount < 2 && error instanceof ApiError && error.status === 0;

export const useLoginMutation = () => {
  const onSuccess = useAuthMutationSuccess();

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: login,
    onSuccess,
    retry: retryUnreachable,
  });
};

export const useRegisterMutation = () => {
  const onSuccess = useAuthMutationSuccess();

  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: register,
    onSuccess,
    retry: retryUnreachable,
  });
};

export const useMeQuery = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMe,
    enabled: Boolean(token),
    // A 401 must fail immediately so the session clears, but an unreachable API deserves more
    // attempts: a cold backend or a stale pooled connection after an Android resume both fail this
    // way, and both recover on a retry.
    retry: retryUnreachable,
    staleTime: 0,
    refetchOnMount: 'always',
  });
};
