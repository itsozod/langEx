import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { socket } from '@/shared/lib/socket';

const ACTIVE_CONVERSATION_HEARTBEAT_MS = 20_000;

export function useActiveConversationPresence(conversationId?: string) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isFocusedRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHeartbeat = useCallback(() => {
    if (!heartbeatRef.current) return;
    clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
  }, []);

  const reportPresence = useCallback(() => {
    const isActivelyViewing = isFocusedRef.current && appStateRef.current === 'active';
    stopHeartbeat();

    if (socket.connected) {
      socket.emit('active_conversation', isActivelyViewing ? (conversationId ?? null) : null);
    }

    if (isActivelyViewing && conversationId) {
      heartbeatRef.current = setInterval(() => {
        if (socket.connected) socket.emit('active_conversation', conversationId);
      }, ACTIVE_CONVERSATION_HEARTBEAT_MS);
    }
  }, [conversationId, stopHeartbeat]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      appStateRef.current = nextState;
      reportPresence();
    };

    socket.on('connect', reportPresence);
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    reportPresence();

    return () => {
      stopHeartbeat();
      appStateSubscription.remove();
      socket.off('connect', reportPresence);
      if (socket.connected) socket.emit('active_conversation', null);
    };
  }, [reportPresence, stopHeartbeat]);

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
