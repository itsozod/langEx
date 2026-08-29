import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { OutboxMessage } from '../types/message.types';

let persistenceBarrier: Promise<void> = Promise.resolve();

const trackedStorage = {
  getItem: (name: string) => AsyncStorage.getItem(name),
  setItem: (name: string, value: string) => {
    const write = persistenceBarrier.catch(() => {}).then(() => AsyncStorage.setItem(name, value));
    persistenceBarrier = write;
    return write;
  },
  removeItem: (name: string) => {
    const removal = persistenceBarrier.catch(() => {}).then(() => AsyncStorage.removeItem(name));
    persistenceBarrier = removal;
    return removal;
  },
};

/** Prevents network transmission from racing ahead of the durable AsyncStorage write. */
export function waitForOutboxPersistence() {
  return persistenceBarrier;
}

type NewOutboxMessage = Omit<
  OutboxMessage,
  'attemptCount' | 'clientMessageId' | 'nextAttemptAt' | 'status'
>;

type OutboxState = {
  messages: OutboxMessage[];
  enqueue: (message: NewOutboxMessage) => OutboxMessage;
  markSending: (clientMessageId: string) => void;
  scheduleRetry: (clientMessageId: string, error: string, nextAttemptAt: number) => void;
  markFailed: (clientMessageId: string, error: string) => void;
  retry: (clientMessageId: string) => void;
  remove: (clientMessageId: string) => void;
  clearUser: (userId: string) => void;
};

function createClientMessageId() {
  const random = () => Math.random().toString(36).slice(2, 12);
  return `msg-${Date.now().toString(36)}-${random()}-${random()}`;
}

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      messages: [],
      enqueue: (message) => {
        const queued: OutboxMessage = {
          ...message,
          clientMessageId: createClientMessageId(),
          status: 'queued',
          attemptCount: 0,
          nextAttemptAt: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, queued] }));
        return queued;
      },
      markSending: (clientMessageId) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.clientMessageId === clientMessageId
              ? {
                  ...message,
                  status: 'sending',
                  attemptCount: message.attemptCount + 1,
                  error: undefined,
                }
              : message,
          ),
        })),
      scheduleRetry: (clientMessageId, error, nextAttemptAt) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.clientMessageId === clientMessageId
              ? { ...message, status: 'queued', error, nextAttemptAt }
              : message,
          ),
        })),
      markFailed: (clientMessageId, error) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.clientMessageId === clientMessageId
              ? { ...message, status: 'failed', error }
              : message,
          ),
        })),
      retry: (clientMessageId) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.clientMessageId === clientMessageId
              ? {
                  ...message,
                  status: 'queued',
                  attemptCount: 0,
                  error: undefined,
                  nextAttemptAt: Date.now(),
                }
              : message,
          ),
        })),
      remove: (clientMessageId) =>
        set((state) => ({
          messages: state.messages.filter((message) => message.clientMessageId !== clientMessageId),
        })),
      clearUser: (userId) =>
        set((state) => ({
          messages: state.messages.filter((message) => message.userId !== userId),
        })),
    }),
    {
      name: 'langex-message-outbox-v1',
      storage: createJSONStorage(() => trackedStorage),
      partialize: ({ messages }) => ({ messages }),
    },
  ),
);
