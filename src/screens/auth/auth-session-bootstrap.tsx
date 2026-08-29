import { useEffect } from 'react';

import { ApiError } from '@/shared/lib/api-client';
import { useAuthStore } from '@/shared/store/auth-store';
import { useUserStore } from '@/shared/store/user.store';

import { useMeQuery } from './hooks';

export function useAuthSessionBootstrap() {
  const token = useAuthStore((state) => state.token);
  const storedUser = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const { data, error, isPending } = useMeQuery();
  const isUnauthorized = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data, setUser]);

  return {
    isUnauthorized,
    // Only block on `/me` when there is nothing to render yet. A persisted user is enough to enter
    // the app; verification keeps running in the background and a 401 still clears the session.
    // Blocking on a hydrated session meant one slow or dead `/me` stranded the app on the loading
    // gate - reachable on Android, where a backgrounded process cold-starts on reopen.
    isVerifying: Boolean(token) && !storedUser && isPending,
    user: data?.user ?? storedUser,
  };
}
