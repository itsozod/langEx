import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryClient } from '@/providers/query-provider';
import { socket } from '@/shared/lib/socket';
import { useAuthStore } from '@/shared/store/auth-store';

import { getUserPresence } from '../api';
import type { UserPresence, UserPresenceResponse } from '../types/message.types';
import { chatQueryKeys } from './queries';

export function useUserPresence(userId?: string, initialPresence?: UserPresence) {
  const accountId = useAuthStore((state) => state.activeAccountId);
  const token = useAuthStore((state) => state.token);
  const queryKey = chatQueryKeys.presence(accountId ?? '', userId ?? '');
  const query = useQuery({
    queryKey,
    queryFn: () => getUserPresence(userId as string),
    enabled: Boolean(accountId && token && userId),
    initialData: initialPresence ? { presence: initialPresence } : undefined,
    // The list snapshot renders immediately, but the dedicated endpoint still refreshes it when
    // the thread opens instead of treating the seed as fresh for the full stale window.
    initialDataUpdatedAt: initialPresence ? 0 : undefined,
    refetchOnWindowFocus: 'always',
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!accountId || !userId) return;
    const presenceQueryKey = chatQueryKeys.presence(accountId, userId);

    const handlePresenceChanged = (presence: UserPresence) => {
      if (presence.userId !== userId) return;

      // Prevent an older in-flight REST snapshot from replacing the newer socket transition.
      void queryClient.cancelQueries({ exact: true, queryKey: presenceQueryKey }).then(() => {
        queryClient.setQueryData<UserPresenceResponse>(presenceQueryKey, { presence });
      });
    };

    socket.on('user_presence_changed', handlePresenceChanged);
    return () => {
      socket.off('user_presence_changed', handlePresenceChanged);
    };
  }, [accountId, userId]);

  return query;
}
