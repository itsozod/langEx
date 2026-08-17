import { useEffect } from 'react';

import { ApiError } from '@/shared/lib/api-client';
import { useAuthStore } from '@/shared/store/auth-store';

import { useMeQuery } from './hooks';

export function useAuthSessionBootstrap() {
  const token = useAuthStore((state) => state.token);
  const storedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { data, error, isPending } = useMeQuery();
  const isUnauthorized = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data, setUser]);

  useEffect(() => {
    if (isUnauthorized) {
      clearSession();
    }
  }, [clearSession, isUnauthorized]);

  return {
    isUnauthorized,
    isVerifying: Boolean(token) && isPending && !data,
    user: data?.user ?? storedUser,
  };
}
