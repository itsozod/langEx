import type { Message, OutboxMessage } from '../types/message.types';

export type OutboxDelivery = {
  outboxMessage: OutboxMessage;
  conversationId: string;
  message: Message;
};

type DeliveryListener = (delivery: OutboxDelivery) => void;

const listeners = new Map<string, Set<DeliveryListener>>();

export function subscribeToOutboxDelivery(clientMessageId: string, listener: DeliveryListener) {
  const messageListeners = listeners.get(clientMessageId) ?? new Set<DeliveryListener>();
  messageListeners.add(listener);
  listeners.set(clientMessageId, messageListeners);

  return () => {
    messageListeners.delete(listener);
    if (!messageListeners.size) listeners.delete(clientMessageId);
  };
}

export function publishOutboxDelivery(delivery: OutboxDelivery) {
  listeners.get(delivery.outboxMessage.clientMessageId)?.forEach((listener) => listener(delivery));
  listeners.delete(delivery.outboxMessage.clientMessageId);
}
