import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/store/auth-store';

import { getMe, login, register } from './api';

export const authQueryKeys = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
};

const useAuthMutationSuccess = () => {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return (data: Awaited<ReturnType<typeof login>>) => {
    setSession(data.token, data.user);
    queryClient.setQueryData(authQueryKeys.me, { user: data.user });
  };
};

export const useLoginMutation = () => {
  const onSuccess = useAuthMutationSuccess();

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: login,
    onSuccess,
  });
};

export const useRegisterMutation = () => {
  const onSuccess = useAuthMutationSuccess();

  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: register,
    onSuccess,
  });
};

export const useMeQuery = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 0,
    refetchOnMount: 'always',
  });
};
