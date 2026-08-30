import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { queryClient } from '@/providers/query-provider';
import { prepareSocketAuth, socket } from '@/shared/lib/socket';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chat-store';
import { useUserStore } from '@/shared/store/user.store';

import { chatQueryKeys } from './hooks';
import { useOutboxStore, waitForOutboxPersistence } from './store/outbox-store';
import type { OutboxMessage, SocketAcknowledgement } from './types/message.types';
import { upsertMessageInLatestWindow } from './utils/conversation-cache';
import { isMessage } from './utils/messages';
import { publishOutboxDelivery } from './utils/outbox-events';

const ACK_TIMEOUT_MS = 15_000;
const MAX_AUTOMATIC_ATTEMPTS = 5;
const MAX_RETRY_DELAY_MS = 30_000;

function retryDelay(attemptCount: number) {
  return Math.min(2_000 * 2 ** Math.max(0, attemptCount - 1), MAX_RETRY_DELAY_MS);
}

function isPermanentSendError(message: string) {
  return /required|non-empty|not found|not a participant|cannot message|already been used|deleted their account|read-only/i.test(
    message,
  );
}

function emitOutboxMessage(message: OutboxMessage) {
  return new Promise<SocketAcknowledgement>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      reject(new Error('Message acknowledgement timed out.'));
    }, ACK_TIMEOUT_MS);

    socket.emit(
      'send_message',
      {
        clientMessageId: message.clientMessageId,
        conversationId: message.conversationId,
        participantId: message.participantId,
        content: message.content,
        replyToId: message.replyToId,
      },
      (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(response);
      },
    );
  });
}

export function OutboxManager() {
  const token = useAuthStore((state) => state.token);
  const userId = useUserStore((state) => state.user?.id);
  const messages = useOutboxStore((state) => state.messages);
  const [wakeVersion, setWakeVersion] = useState(0);
  const inFlightIds = useRef(new Set<string>());
  const isMounted = useRef(true);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  useEffect(() => {
    const wake = () => setWakeVersion((value) => value + 1);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') wake();
    });
    socket.on('connect', wake);

    return () => {
      appStateSubscription.remove();
      socket.off('connect', wake);
    };
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    const now = Date.now();
    // Send one at a time so messages keep the order in which the user composed them while offline.
    const candidate = messages
      .filter((message) => message.userId === userId && message.status !== 'failed')
      .sort((first, second) => first.createdAt.localeCompare(second.createdAt))[0];
    const ready =
      candidate &&
      candidate.nextAttemptAt <= now &&
      !inFlightIds.current.has(candidate.clientMessageId)
        ? [candidate]
        : [];
    const nextAttemptAt =
      candidate && candidate.nextAttemptAt > now ? candidate.nextAttemptAt : null;

    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    if (nextAttemptAt !== null) {
      retryTimer = setTimeout(
        () => setWakeVersion((value) => value + 1),
        Math.max(0, nextAttemptAt - now),
      );
    }

    if (ready.length && !socket.connected) {
      prepareSocketAuth();
      socket.connect();
    }

    if (socket.connected) {
      ready.forEach((message) => {
        inFlightIds.current.add(message.clientMessageId);
        useOutboxStore.getState().markSending(message.clientMessageId);

        void waitForOutboxPersistence()
          .then(() => emitOutboxMessage(message))
          .then((response) => {
            const currentSession = useAuthStore.getState();
            if (currentSession.token !== token || currentSession.activeAccountId !== userId) return;

            if (!response.ok || !response.message || !isMessage(response.message)) {
              const error = response.error ?? 'Message could not be sent.';
              const attemptCount = message.attemptCount + 1;
              if (isPermanentSendError(error) || attemptCount >= MAX_AUTOMATIC_ATTEMPTS) {
                useOutboxStore.getState().markFailed(message.clientMessageId, error);
              } else {
                useOutboxStore
                  .getState()
                  .scheduleRetry(
                    message.clientMessageId,
                    error,
                    Date.now() + retryDelay(attemptCount),
                  );
              }
              return;
            }

            const conversationId = response.conversationId ?? response.message.conversationId;
            if (!conversationId) {
              useOutboxStore
                .getState()
                .markFailed(message.clientMessageId, 'The server did not return a conversation.');
              return;
            }

            const confirmedMessage = {
              ...response.message,
              conversationId,
            };
            useChatStore.getState().addMessage(confirmedMessage);
            upsertMessageInLatestWindow(conversationId, confirmedMessage);
            publishOutboxDelivery({
              outboxMessage: message,
              conversationId,
              message: confirmedMessage,
            });
            useOutboxStore.getState().remove(message.clientMessageId);
            void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
          })
          .catch((error: unknown) => {
            const attemptCount = message.attemptCount + 1;
            const errorMessage = error instanceof Error ? error.message : 'Connection interrupted.';
            if (attemptCount >= MAX_AUTOMATIC_ATTEMPTS) {
              useOutboxStore.getState().markFailed(message.clientMessageId, errorMessage);
            } else {
              useOutboxStore
                .getState()
                .scheduleRetry(
                  message.clientMessageId,
                  errorMessage,
                  Date.now() + retryDelay(attemptCount),
                );
            }
          })
          .finally(() => {
            inFlightIds.current.delete(message.clientMessageId);
            if (isMounted.current) setWakeVersion((value) => value + 1);
          });
      });
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [messages, token, userId, wakeVersion]);

  return null;
}
