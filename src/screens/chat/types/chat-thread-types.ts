import type { AppTheme } from '@/providers/theme-provider';
import type { AuthUser } from '@/screens/auth/types';

import type { ChatImageSelection, GiftedMessage, GiftedReplyMessage } from './message.types';

export type ChatThreadConversation = {
  id?: string;
  currentUser: AuthUser | null;
  isHistoricalWindow: boolean;
  isReadOnly: boolean;
};

export type ChatThreadHistory = {
  hasNewerMessages: boolean;
  hasOlderMessages: boolean;
  isLoadingMessageWindow: boolean;
  olderLoadFailed: boolean;
  messageWindowLoadFailed: boolean;
  isLoadingOlderMessages: boolean;
  onJumpToLatest: () => void;
  onLoadNewerMessages: () => void;
  onLoadOlderMessages: () => void;
  onRequestMessageWindow: (messageId: string) => void;
  onRetryMessageWindow: () => void;
};

export type ChatThreadMessaging = {
  cancelImages: () => void;
  confirmImages: () => void;
  editMessage: (messageId: string, content: string) => void;
  giftedMessages: GiftedMessage[];
  handleChooseImages: () => void;
  handleInputChange: (text: string) => void;
  handleSend: (messages: GiftedMessage[]) => void;
  removeSelectedImage: (index: number) => void;
  retryMessage: (clientMessageId: string) => void;
  replyingTo: GiftedReplyMessage | null;
  selectedImages: ChatImageSelection[];
  setReplyingTo: (message: GiftedReplyMessage | null) => void;
  unsendMessage: (messageId: string) => void;
};

export type ChatThreadPresentation = {
  theme: AppTheme;
  topInset: number;
  typingUsers: string[];
};

export type ChatThreadProps = {
  conversation: ChatThreadConversation;
  history: ChatThreadHistory;
  messaging: ChatThreadMessaging;
  presentation: ChatThreadPresentation;
};
