import { useCallback, useMemo } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import type { MessageProps } from 'react-native-gifted-chat';
import type { SharedValue } from 'react-native-reanimated';

import type { AuthUser } from '@/screens/auth/types';

import { ChatMessage, type MessageAnchor } from '../components/chat-message';
import type { GiftedMessage } from '../types/message.types';

type UseChatMessageRendererOptions = {
  currentUser: AuthUser | null;
  highlightedMessageId: SharedValue<string | null>;
  isReadOnly: boolean;
  jumpToMessage: (messageId: string) => void;
  onMessageLayout: (messageId: string, event: LayoutChangeEvent) => void;
  onRetryMessage: (clientMessageId: string) => void;
  openMessageMenu: (message: GiftedMessage, anchor: MessageAnchor) => void;
};

export function useChatMessageRenderer({
  currentUser,
  highlightedMessageId,
  isReadOnly,
  jumpToMessage,
  onMessageLayout,
  onRetryMessage,
  openMessageMenu,
}: UseChatMessageRendererOptions) {
  const giftedUser = useMemo(
    () => ({
      _id: currentUser?.id ?? '',
      name: currentUser?.displayName || currentUser?.email || 'You',
      avatar: currentUser?.avatarUrl || undefined,
    }),
    [currentUser?.avatarUrl, currentUser?.displayName, currentUser?.email, currentUser?.id],
  );
  const renderMessage = useCallback(
    (props: MessageProps<GiftedMessage>) => (
      <ChatMessage
        {...props}
        highlightedMessageId={highlightedMessageId}
        onJumpToMessage={jumpToMessage}
        onMessageLayoutById={onMessageLayout}
        onOpenMenu={isReadOnly ? undefined : openMessageMenu}
        onRetryMessage={onRetryMessage}
      />
    ),
    [
      highlightedMessageId,
      isReadOnly,
      jumpToMessage,
      onMessageLayout,
      onRetryMessage,
      openMessageMenu,
    ],
  );

  return { giftedUser, renderMessage };
}
