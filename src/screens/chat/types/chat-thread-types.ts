import type { ReplyMessage } from 'react-native-gifted-chat';

import type { AppTheme } from '@/providers/theme-provider';
import type { AuthUser } from '@/screens/auth/types';

import type { GiftedMessage } from './message.types';

export type ChatThreadProps = {
  conversationId?: string;
  currentUser: AuthUser | null;
  giftedMessages: GiftedMessage[];
  hasNewerMessages: boolean;
  hasNextPage: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  isHistoricalWindow: boolean;
  isReadOnly: boolean;
  onInputChange: (text: string) => void;
  onJumpToLatest: () => void;
  onLoadNewerMessages: () => void;
  onLoadOlderMessages: () => void;
  onEditMessage: (messageId: string, content: string) => void;
  onRequestMessageWindow: (messageId: string) => void;
  onRetryMessage: (clientMessageId: string) => void;
  onSend: (messages: GiftedMessage[]) => void;
  onUnsendMessage: (messageId: string) => void;
  replyingTo: ReplyMessage | null;
  setReplyingTo: (message: ReplyMessage | null) => void;
  theme: AppTheme;
  topInset: number;
  typingUsers: string[];
};
