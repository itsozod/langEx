import type { Message, OutboxMessage } from '../types';

export function outboxMessageToOptimisticMessage(message: OutboxMessage): Message {
  return {
    id: message.clientMessageId,
    clientMessageId: message.clientMessageId,
    content: message.content,
    senderId: message.userId,
    conversationId: message.conversationId,
    createdAt: message.createdAt,
    replyTo: message.replyTo,
    isOptimistic: true,
    deliveryStatus: message.status,
    sendError: message.error,
  };
}

export function belongsToChat(
  message: OutboxMessage,
  conversationId?: string,
  participantId?: string,
) {
  return conversationId
    ? message.conversationId === conversationId
    : !message.conversationId && message.participantId === participantId;
}
