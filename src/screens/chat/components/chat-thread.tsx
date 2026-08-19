import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Clipboard, View } from 'react-native';
import { GiftedChat, type ReplyMessage } from 'react-native-gifted-chat';
import { useSharedValue } from 'react-native-reanimated';

import type { AppTheme } from '@/providers/theme-provider';
import type { AuthUser } from '@/screens/auth/types';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { CHAT_HEADER_HEIGHT } from '../constants';
import { useChatAutoscroll } from '../hooks/use-chat-autoscroll';
import { useChatJumpToMessage } from '../hooks/use-chat-jump-to-message';
import { useChatStyles } from '../styles/chat-styles';
import type { GiftedMessage } from '../types';
import { ChatInputToolbar, ChatSend } from './chat-composer';
import { ChatJumpToLatest } from './chat-jump-to-latest';
import { ChatMessage, ReplySwipeAction, type MessageAnchor } from './chat-message';
import { ChatMessageMenu, type MessageMenuTarget } from './chat-message-menu';
import { ChatReplyPreview } from './chat-reply-preview';
import { OlderMessagesLoader } from './older-messages-loader';

/** Distance from the newest end at which the next newer page is requested. */
const LOAD_NEWER_OFFSET = 600;
/** Distance from the newest end that counts as having reached the end of the thread. */
const AT_LATEST_OFFSET = 80;

type ChatThreadProps = {
  currentUser: AuthUser | null;
  giftedMessages: GiftedMessage[];
  hasNewerMessages: boolean;
  hasNextPage: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  isHistoricalWindow: boolean;
  onInputChange: (text: string) => void;
  onJumpToLatest: () => void;
  onLoadNewerMessages: () => void;
  onLoadOlderMessages: () => void;
  onRequestMessageWindow: (messageId: string) => void;
  onSend: (messages: GiftedMessage[]) => void;
  replyingTo: ReplyMessage | null;
  setReplyingTo: (message: ReplyMessage | null) => void;
  theme: AppTheme;
  topInset: number;
  typingUsers: string[];
};

export function ChatThread({
  currentUser,
  giftedMessages,
  hasNewerMessages,
  hasNextPage,
  isFetchNextPageError,
  isFetchingNextPage,
  isHistoricalWindow,
  onInputChange,
  onJumpToLatest,
  onLoadNewerMessages,
  onLoadOlderMessages,
  onRequestMessageWindow,
  onSend,
  replyingTo,
  setReplyingTo,
  theme,
  topInset,
  typingUsers,
}: ChatThreadProps) {
  const styles = useChatStyles();
  const currentUserId = currentUser?.id;
  const {
    listRef,
    maintainVisibleContentPosition,
    messagesContainerRef,
    scrollToLatestAfterSend,
    scrollToLatestWindow,
  } = useChatAutoscroll();
  const { handleScrollToIndexFailed, highlightedMessageId, isRevealPending, jumpToMessage } =
    useChatJumpToMessage({
      listRef,
      messages: giftedMessages,
      onRequestMessageWindow,
    });
  const scrolledY = useSharedValue(0);
  const [menuTarget, setMenuTarget] = useState<MessageMenuTarget | null>(null);

  const startReply = useCallback(
    (message: GiftedMessage) => {
      if (message.pending) return;
      setReplyingTo({
        _id: message._id,
        text: message.text,
        user: message.user,
        image: message.image,
        audio: message.audio,
      });
      void Haptics.selectionAsync().catch(() => {});
    },
    [setReplyingTo],
  );

  const openMessageMenu = useCallback(
    (message: GiftedMessage, anchor: MessageAnchor) => {
      setMenuTarget({
        anchor,
        isOwnMessage: String(message.user._id) === String(currentUserId),
        message,
      });
    },
    [currentUserId],
  );
  const closeMessageMenu = useCallback(() => setMenuTarget(null), []);
  const replyFromMenu = useCallback(
    (message: GiftedMessage) => {
      setMenuTarget(null);
      startReply(message);
    },
    [startReply],
  );
  const copyFromMenu = useCallback((message: GiftedMessage) => {
    setMenuTarget(null);
    Clipboard.setString(message.text);
  }, []);

  // Offset 0 is the newest end of the inverted list, so nearing it means asking for newer messages.
  const handleScroll = useCallback(
    (event: { contentOffset: { y: number } }) => {
      scrolledY.value = event.contentOffset.y;
      // Paging renumbers rows, so it must never run while a jump is still resolving its target.
      if (isRevealPending()) return;
      if (event.contentOffset.y < LOAD_NEWER_OFFSET) onLoadNewerMessages();

      // Scrolling an older window forward until nothing newer is left means the thread has caught
      // up with the present, so it rejoins the live window: the arrow goes away and messages
      // arriving over the socket start appearing again.
      if (isHistoricalWindow && !hasNewerMessages && event.contentOffset.y < AT_LATEST_OFFSET)
        onJumpToLatest();
    },
    // `scrolledY` is a shared value and is stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasNewerMessages, isHistoricalWindow, isRevealPending, onJumpToLatest, onLoadNewerMessages],
  );

  const jumpToLatest = useCallback(() => {
    if (!isHistoricalWindow) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
      return;
    }

    onJumpToLatest();
    scrollToLatestWindow();
  }, [isHistoricalWindow, listRef, onJumpToLatest, scrollToLatestWindow]);

  const handleSend = useCallback(
    (messages: GiftedMessage[]) => {
      // A message sent from an old window belongs at the end of the thread, so return there first.
      if (isHistoricalWindow) onJumpToLatest();
      onSend(messages);
      scrollToLatestAfterSend();
    },
    [isHistoricalWindow, onJumpToLatest, onSend, scrollToLatestAfterSend],
  );

  return (
    <View style={styles.chat}>
      <GiftedChat<GiftedMessage>
        messages={giftedMessages}
        messagesContainerRef={messagesContainerRef}
        onSend={handleSend}
        user={{
          _id: currentUserId ?? '',
          name: currentUser?.displayName || currentUser?.email || 'You',
          avatar: currentUser?.avatarUrl || undefined,
        }}
        colorScheme={theme}
        isTyping={typingUsers.length > 0}
        isSendButtonAlwaysVisible
        isDayAnimationEnabled={false}
        renderAvatar={null}
        renderMessage={(props) => (
          <ChatMessage
            {...props}
            highlightedMessageId={highlightedMessageId}
            onJumpToMessage={jumpToMessage}
            onOpenMenu={openMessageMenu}
          />
        )}
        renderInputToolbar={(props) => <ChatInputToolbar {...props} />}
        renderSend={(props) => <ChatSend {...props} />}
        renderTypingIndicator={() =>
          typingUsers.length ? <ThemedText style={styles.typingText}>typing...</ThemedText> : null
        }
        renderChatFooter={() => (
          <ChatJumpToLatest
            isAlwaysVisible={isHistoricalWindow}
            onPress={jumpToLatest}
            scrolledY={scrolledY}
          />
        )}
        renderChatEmpty={() => (
          <View style={styles.emptyChat}>
            <ThemedText type="bold" style={styles.emptyTitle}>
              Say hello 👋
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyMessage}>
              Send the first message to start your conversation.
            </ThemedText>
          </View>
        )}
        loadEarlierMessagesProps={{
          isAvailable: hasNextPage,
          isLoading: isFetchingNextPage,
          isInfiniteScrollEnabled: true,
          onPress: onLoadOlderMessages,
        }}
        renderLoadEarlier={(props) => (
          <OlderMessagesLoader {...props} hasError={isFetchNextPageError} />
        )}
        reply={{
          message: replyingTo,
          onClear: () => setReplyingTo(null),
          renderPreview: (props) => <ChatReplyPreview {...props} currentUserId={currentUserId} />,
          swipe: {
            isEnabled: true,
            direction: 'right',
            onSwipe: startReply,
            renderAction: () => <ReplySwipeAction />,
          },
        }}
        messagesContainerStyle={styles.messagesContainer}
        listProps={{
          contentContainerStyle: styles.messageList,
          keyboardShouldPersistTaps: 'handled',
          maintainVisibleContentPosition,
          onScroll: handleScroll,
          onScrollToIndexFailed: handleScrollToIndexFailed,
        }}
        keyboardAvoidingViewProps={{
          automaticOffset: false,
          keyboardVerticalOffset: topInset + CHAT_HEADER_HEIGHT,
        }}
        textInputProps={{
          onChangeText: onInputChange,
          placeholder: 'Write a message…',
          placeholderTextColor: styles.placeholder.color,
          style: styles.composer,
          multiline: true,
        }}
      />
      <ChatMessageMenu
        onClose={closeMessageMenu}
        onCopy={copyFromMenu}
        onReply={replyFromMenu}
        target={menuTarget}
      />
    </View>
  );
}
