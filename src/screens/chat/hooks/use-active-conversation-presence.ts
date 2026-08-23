import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { socket } from '@/shared/lib/socket';

export function useActiveConversationPresence(conversationId?: string) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isFocusedRef = useRef(false);

  const reportPresence = useCallback(() => {
    if (!socket.connected) return;
    const isActivelyViewing = isFocusedRef.current && appStateRef.current === 'active';
    socket.emit('active_conversation', isActivelyViewing ? (conversationId ?? null) : null);
  }, [conversationId]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      appStateRef.current = nextState;
      reportPresence();
    };

    socket.on('connect', reportPresence);
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    reportPresence();

    return () => {
      appStateSubscription.remove();
      socket.off('connect', reportPresence);
      if (socket.connected) socket.emit('active_conversation', null);
    };
  }, [reportPresence]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      reportPresence();

      return () => {
        isFocusedRef.current = false;
        reportPresence();
      };
    }, [reportPresence]),
  );
}
