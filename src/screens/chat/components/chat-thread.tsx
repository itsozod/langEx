import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

import { useChatStore } from '@/shared/store/chat-store';
import { CHAT_HEADER_HEIGHT } from '../constants';
import { useChatAutoscroll } from '../hooks/use-chat-autoscroll';
import { useChatComposer } from '../hooks/use-chat-composer';
import { useChatJumpToMessage } from '../hooks/use-chat-jump-to-message';
import { useChatListProps } from '../hooks/use-chat-list-props';
import { useChatMessageRenderer } from '../hooks/use-chat-message-renderer';
import { useChatMessageActions } from '../hooks/use-chat-message-actions';
import { useChatReadOnly } from '../hooks/use-chat-read-only';
import { useChatStyles } from '../styles/chat-styles';
import type { ChatThreadProps } from '../types/chat-thread-types';
import type { GiftedMessage } from '../types/message.types';
import { ChatInputToolbar, ChatSend } from './chat-composer';
import { ChatImageConfirmation } from './chat-image-confirmation';
import { ChatJumpToLatest } from './chat-jump-to-latest';
import { ChatMessageLoadStatus } from './chat-message-load-status';
import { ReplySwipeAction } from './chat-message';
import { ChatMessageMenu } from './chat-message-menu';
import { ChatReplyPreview } from './chat-reply-preview';
import { ChatEmptyState, DeletedUserNotice } from './chat-thread-states';
import { ChatTypingIndicator } from './chat-typing-indicator';
import { OlderMessagesLoader } from './older-messages-loader';

const LOAD_NEWER_OFFSET = 600;
const AT_LATEST_OFFSET = 80;
const SCROLLED_AWAY_OFFSET = 420;
export function ChatThread({ conversation, history, messaging, presentation }: ChatThreadProps) {
  const { id: conversationId, currentUser, isHistoricalWindow, isReadOnly } = conversation;
  const {
    hasNewerMessages,
    hasOlderMessages,
    isLoadingMessageWindow: messageLoading,
    olderLoadFailed,
    messageWindowLoadFailed: messageLoadFailed,
    isLoadingOlderMessages,
    onJumpToLatest,
    onLoadNewerMessages,
    onLoadOlderMessages,
    onRequestMessageWindow,
    onRetryMessageWindow: retryMessageWindow,
  } = history;
  const {
    cancelImages,
    confirmImages,
    editMessage,
    giftedMessages,
    handleChooseImages,
    handleInputChange: notifyInputChange,
    handleSend: sendMessage,
    removeSelectedImage,
    retryMessage,
    replyingTo,
    selectedImages,
    setReplyingTo,
    unsendMessage,
  } = messaging;
  const { theme, topInset, typingUsers } = presentation;
  const styles = useChatStyles();
  const currentUserId = currentUser?.id;
  const scrollOffsetRef = useRef(0);
  const {
    listRef,
    maintainVisibleContentPosition,
    messagesContainerRef,
    resumeReadingPositionAnchor,
    scrollToLatestAfterSend,
    scrollToLatestWindow,
    suspendReadingPositionAnchor,
  } = useChatAutoscroll(isHistoricalWindow);
  const {
    highlightedMessageId,
    isRevealPending,
    jumpToMessage,
    onMessageLayout,
    onScrollBeginDrag,
    onScrollEnd,
    onScrollFailed,
  } = useChatJumpToMessage({
    listRef,
    messages: giftedMessages,
    onRevealSettled: resumeReadingPositionAnchor,
    onRevealStart: suspendReadingPositionAnchor,
    onRequestMessageWindow,
    scrollOffsetRef,
  });
  const wasScrolledAwayRef = useRef(false);
  const wasAtLatestRef = useRef(true);
  const [isScrolledAway, setIsScrolledAway] = useState(false);
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
        const isAwayFromLatest = isHistoricalWindow || scrollOffsetRef.current > AT_LATEST_OFFSET;
        if (isIncoming && isAwayFromLatest) setUnseenMessageCount((count) => count + 1);
      }),
    [conversationId, currentUserId, isHistoricalWindow],
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
    onEditMessage: editMessage,
    onInputChange: notifyInputChange,
    onJumpToLatest,
    onSend: sendMessage,
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
    onUnsendMessage: unsendMessage,
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
  const jumpToLatest = useCallback(() => {
    setUnseenMessageCount(0);
    if (!isHistoricalWindow) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
      return;
    }

    onJumpToLatest();
    scrollToLatestWindow();
  }, [isHistoricalWindow, listRef, onJumpToLatest, scrollToLatestWindow]);
  const handleScroll = useCallback(
    (event: { contentOffset: { y: number } }) => {
      const offset = event.contentOffset.y;
      scrollOffsetRef.current = offset;
      const hasScrolledAway = offset > SCROLLED_AWAY_OFFSET;
      if (hasScrolledAway !== wasScrolledAwayRef.current) {
        wasScrolledAwayRef.current = hasScrolledAway;
        setIsScrolledAway(hasScrolledAway);
      }
      const isAtLatest = !isHistoricalWindow && offset < AT_LATEST_OFFSET;
      if (isAtLatest && !wasAtLatestRef.current) setUnseenMessageCount(0);
      wasAtLatestRef.current = isAtLatest;
      if (isRevealPending()) return;
      if (offset < LOAD_NEWER_OFFSET) onLoadNewerMessages();

      if (isHistoricalWindow && !hasNewerMessages && offset < AT_LATEST_OFFSET) jumpToLatest();
    },
    [hasNewerMessages, isHistoricalWindow, isRevealPending, jumpToLatest, onLoadNewerMessages],
  );
  const { giftedUser, renderMessage } = useChatMessageRenderer({
    currentUser,
    highlightedMessageId,
    isReadOnly,
    jumpToMessage,
    onMessageLayout,
    onRetryMessage: retryMessage,
    openMessageMenu,
  });
  const listProps = useChatListProps({
    contentContainerStyle: styles.messageList,
    maintainVisibleContentPosition,
    onMomentumScrollEnd: onScrollEnd,
    onScrollBeginDrag,
    onScroll: handleScroll,
    onScrollToIndexFailed: onScrollFailed,
  });

  return (
    <View style={styles.chat}>
      <GiftedChat<GiftedMessage>
        messages={giftedMessages}
        text={composerText}
        messagesContainerRef={messagesContainerRef}
        onSend={handleSend}
        user={giftedUser}
        colorScheme={theme}
        isTyping={typingUsers.length > 0}
        isSendButtonAlwaysVisible
        isDayAnimationEnabled={false}
        renderAvatar={null}
        renderMessage={renderMessage}
        renderInputToolbar={
          isReadOnly
            ? () => null
            : (props) => (
                <ChatInputToolbar
                  {...props}
                  isEditing={editing !== null}
                  onCancelEdit={stopEditingAndResetComposer}
                  onChooseImages={handleChooseImages}
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
            isScrolledAway={isScrolledAway}
            newMessageCount={unseenMessageCount}
            onPress={jumpToLatest}
          />
        )}
        renderChatEmpty={() => <ChatEmptyState />}
        loadEarlierMessagesProps={{
          isAvailable: hasOlderMessages,
          isLoading: isLoadingOlderMessages,
          isInfiniteScrollEnabled: true,
          onPress: onLoadOlderMessages,
        }}
        renderLoadEarlier={(props) => <OlderMessagesLoader {...props} hasError={olderLoadFailed} />}
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
        listProps={listProps}
        keyboardAvoidingViewProps={{
          automaticOffset: false,
          keyboardVerticalOffset: topInset + CHAT_HEADER_HEIGHT,
        }}
        textInputProps={{
          onContentSizeChange: handleContentSizeChange,
          onChangeText: handleInputChange,
          placeholder: 'Write a message…',
          placeholderTextColor: styles.placeholder.color,
          scrollEnabled: isComposerScrollable,
          style: [styles.composer, { height: composerHeight }],
          multiline: true,
        }}
      />
      <ChatMessageLoadStatus
        failed={messageLoadFailed}
        loading={messageLoading}
        onRetry={retryMessageWindow}
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
        images={selectedImages}
        onCancel={cancelImages}
        onConfirm={confirmImages}
        onRemove={removeSelectedImage}
      />
    </View>
  );
}
