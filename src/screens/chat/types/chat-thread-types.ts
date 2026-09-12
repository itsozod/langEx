import type { AppTheme } from '@/providers/theme-provider';
import type { AuthUser } from '@/screens/auth/types';

import type { ChatImageSelection, GiftedMessage, GiftedReplyMessage } from './message.types';

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
  imageSelection: ChatImageSelection[];
  onCancelImages: () => void;
  onConfirmImages: () => void;
  onInputChange: (text: string) => void;
  onChooseImages: () => void;
  onRemoveSelectedImage: (index: number) => void;
  onJumpToLatest: () => void;
  onLoadNewerMessages: () => void;
  onLoadOlderMessages: () => void;
  onEditMessage: (messageId: string, content: string) => void;
  onRequestMessageWindow: (messageId: string) => void;
  onRetryMessage: (clientMessageId: string) => void;
  onSend: (messages: GiftedMessage[]) => void;
  onUnsendMessage: (messageId: string) => void;
  replyingTo: GiftedReplyMessage | null;
  setReplyingTo: (message: GiftedReplyMessage | null) => void;
  theme: AppTheme;
  topInset: number;
  typingUsers: string[];
};
