import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useSharedValue } from 'react-native-reanimated';

import { useChatStore } from '@/shared/store/chat-store';
import { CHAT_HEADER_HEIGHT } from '../constants';
import { useChatAutoscroll } from '../hooks/use-chat-autoscroll';
import { useChatComposer } from '../hooks/use-chat-composer';
import { useChatJumpToMessage } from '../hooks/use-chat-jump-to-message';
import { useChatMessageActions } from '../hooks/use-chat-message-actions';
import { useChatReadOnly } from '../hooks/use-chat-read-only';
import { useChatStyles } from '../styles/chat-styles';
import type { ChatThreadProps } from '../types/chat-thread-types';
import type { GiftedMessage } from '../types/message.types';
import { ChatInputToolbar, ChatSend } from './chat-composer';
import { ChatImageConfirmation } from './chat-image-confirmation';
import { ChatJumpToLatest } from './chat-jump-to-latest';
import { ChatMessage, ReplySwipeAction } from './chat-message';
import { ChatMessageMenu } from './chat-message-menu';
import { ChatReplyPreview } from './chat-reply-preview';
import { ChatEmptyState, DeletedUserNotice } from './chat-thread-states';
import { ChatTypingIndicator } from './chat-typing-indicator';
import { OlderMessagesLoader } from './older-messages-loader';

/** Distance from the newest end at which the next newer page is requested. */
const LOAD_NEWER_OFFSET = 600;
/** Distance from the newest end that counts as having reached the end of the thread. */
const AT_LATEST_OFFSET = 80;

export function ChatThread({
  conversationId,
  currentUser,
  giftedMessages,
  hasNewerMessages,
  hasNextPage,
  isFetchNextPageError,
  isFetchingNextPage,
  isHistoricalWindow,
  isReadOnly,
  imageSelection,
  onCancelImages,
  onConfirmImages,
  onInputChange,
  onChooseImages,
  onJumpToLatest,
  onLoadNewerMessages,
  onLoadOlderMessages,
  onEditMessage,
  onRequestMessageWindow,
  onRemoveSelectedImage,
  onRetryMessage,
  onSend,
  onUnsendMessage,
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
  const wasAtLatestRef = useRef(true);
  const [unseenMessageCount, setUnseenMessageCount] = useState(0);

  useEffect(
    () =>
      useChatStore.subscribe((state, previousState) => {
        if (!conversationId) return;

        const latestMessage = state.conversations.find(
          (conversation) => conversation.id === conversationId,
        )?.lastMessage;
        const previousMessage = previousState.conversations.find(
          (conversation) => conversation.id === conversationId,
        )?.lastMessage;
        if (!latestMessage || latestMessage.id === previousMessage?.id) return;

        const isIncoming = latestMessage.senderId !== currentUserId;
        const isAwayFromLatest = isHistoricalWindow || scrolledY.get() > AT_LATEST_OFFSET;
        if (isIncoming && isAwayFromLatest) setUnseenMessageCount((count) => count + 1);
      }),
    [conversationId, currentUserId, isHistoricalWindow, scrolledY],
  );
  const {
    composerHeight,
    composerText,
    editing,
    handleContentSizeChange,
    handleInputChange,
    handleSend,
    isComposerScrollable,
    startEditing,
    stopEditingAndResetComposer,
    submitEdit,
  } = useChatComposer({
    isHistoricalWindow,
    onEditMessage,
    onInputChange,
    onJumpToLatest,
    onSend,
    scrollToLatestAfterSend,
  });

  const {
    closeMessageMenu,
    copyFromMenu,
    copyLinkFromMenu,
    editFromMenu,
    menuTarget,
    openMessageMenu,
    replyFromMenu,
    startReply,
    unsendFromMenu,
  } = useChatMessageActions({
    currentUserId,
    onUnsendMessage,
    setReplyingTo,
    startEditing,
    stopEditingAndResetComposer,
  });

  useChatReadOnly({
    closeMessageMenu,
    isReadOnly,
    setReplyingTo,
    stopEditing: stopEditingAndResetComposer,
  });

  // Offset 0 is the newest end of the inverted list, so nearing it means asking for newer messages.
  const handleScroll = useCallback(
    (event: { contentOffset: { y: number } }) => {
      scrolledY.set(event.contentOffset.y);
      const isAtLatest = !isHistoricalWindow && event.contentOffset.y < AT_LATEST_OFFSET;
      if (isAtLatest && !wasAtLatestRef.current) setUnseenMessageCount(0);
      wasAtLatestRef.current = isAtLatest;
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
    setUnseenMessageCount(0);
    if (!isHistoricalWindow) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
      return;
    }

    onJumpToLatest();
    scrollToLatestWindow();
  }, [isHistoricalWindow, listRef, onJumpToLatest, scrollToLatestWindow]);

  return (
    <View style={styles.chat}>
      <GiftedChat<GiftedMessage>
        messages={giftedMessages}
        text={composerText}
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
            onOpenMenu={isReadOnly ? () => {} : openMessageMenu}
            onRetryMessage={onRetryMessage}
          />
        )}
        renderInputToolbar={
          isReadOnly
            ? () => null
            : (props) => (
                <ChatInputToolbar
                  {...props}
                  isEditing={editing !== null}
                  onCancelEdit={stopEditingAndResetComposer}
                  onChooseImages={onChooseImages}
                />
              )
        }
        renderSend={(props) => (
          <ChatSend {...props} isEditing={editing !== null} onSubmitEdit={submitEdit} />
        )}
        renderTypingIndicator={() => (typingUsers.length ? <ChatTypingIndicator /> : null)}
        renderChatFooter={() => (
          <ChatJumpToLatest
            isAlwaysVisible={isHistoricalWindow}
            newMessageCount={unseenMessageCount}
            onPress={jumpToLatest}
            scrolledY={scrolledY}
          />
        )}
        renderChatEmpty={() => <ChatEmptyState />}
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
            isEnabled: !isReadOnly,
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
          onContentSizeChange: handleContentSizeChange,
          onChangeText: handleInputChange,
          placeholder: 'Write a message…',
          placeholderTextColor: styles.placeholder.color,
          // Android scrolls a multiline input to the cursor before React can grow its explicit
          // height, briefly hiding the previous line. Keep native scrolling off until the input
          // has reached its maximum height and genuinely needs to scroll internally.
          scrollEnabled: isComposerScrollable,
          style: [styles.composer, { height: composerHeight }],
          multiline: true,
        }}
      />
      {isReadOnly ? <DeletedUserNotice /> : null}
      <ChatMessageMenu
        onClose={closeMessageMenu}
        onCopy={copyFromMenu}
        onCopyLink={copyLinkFromMenu}
        onEdit={editFromMenu}
        onReply={replyFromMenu}
        onUnsend={unsendFromMenu}
        target={menuTarget}
      />
      <ChatImageConfirmation
        images={imageSelection}
        onCancel={onCancelImages}
        onConfirm={onConfirmImages}
        onRemove={onRemoveSelectedImage}
      />
    </View>
  );
}
