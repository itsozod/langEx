import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { CHAT_HEADER_HEIGHT } from '../constants';
import { useChatAutoscroll } from '../hooks/use-chat-autoscroll';
import { useChatComposer } from '../hooks/use-chat-composer';
import { useChatJumpToMessage } from '../hooks/use-chat-jump-to-message';
import { useChatLatestNavigation } from '../hooks/use-chat-latest-navigation';
import { useChatMessageRenderer } from '../hooks/use-chat-message-renderer';
import { useChatMessageActions } from '../hooks/use-chat-message-actions';
import { useChatReadOnly } from '../hooks/use-chat-read-only';
import { useChatScrollState } from '../hooks/use-chat-scroll-state';
import { useChatUnseenMessages } from '../hooks/use-chat-unseen-messages';
import { useChatStyles } from '../styles/chat-styles';
import type { ChatThreadProps } from '../types/chat-thread-types';
import { ChatInputToolbar } from './chat-composer';
import { ChatImageConfirmation } from './chat-image-confirmation';
import { ChatJumpToLatest } from './chat-jump-to-latest';
import { ChatMessageList } from './chat-message-list';
import { ChatMessageLoadStatus } from './chat-message-load-status';
import { ChatMessageMenu } from './chat-message-menu';
import { DeletedUserNotice } from './chat-thread-states';

export function ChatThread({ conversation, history, messaging, presentation }: ChatThreadProps) {
  const { id: conversationId, currentUser, isHistoricalWindow, isReadOnly } = conversation;
  const {
    hasNewerMessages,
    hasOlderMessages,
    isLoadingMessageWindow: messageLoading,
    newerLoadFailed,
    olderLoadFailed,
    messageWindowLoadFailed: messageLoadFailed,
    isLoadingNewerMessages,
    isLoadingOlderMessages,
    onJumpToLatest,
    onLoadNewerMessages,
    onLoadOlderMessages: requestOlderMessages,
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
  const latestDistanceRef = useRef(0);
  const { listRef, maintainVisibleContentPosition, scrollToLatestAfterSend, scrollToLatestWindow } =
    useChatAutoscroll(isHistoricalWindow);
  const {
    cancelReveal,
    highlightedMessageId,
    jumpToMessage,
    onScrollBeginDrag: cancelRevealOnDrag,
  } = useChatJumpToMessage({
    listRef,
    messages: giftedMessages,
    onRequestMessageWindow,
  });
  const { clearUnseenMessages, unseenMessageCount } = useChatUnseenMessages({
    conversationId,
    currentUserId,
    isHistoricalWindow,
    latestDistanceRef,
  });
  const promoteToLatest = useCallback(() => {
    clearUnseenMessages();
    onJumpToLatest();
    scrollToLatestWindow();
  }, [clearUnseenMessages, onJumpToLatest, scrollToLatestWindow]);
  const { handleScroll, handleScrollBeginDrag, isScrolledAway, resetManualScroll } =
    useChatScrollState({
      clearUnseenMessages,
      hasNewerMessages,
      isFetchingNewerMessages: isLoadingNewerMessages,
      isHistoricalWindow,
      latestDistanceRef,
      onReachLatest: promoteToLatest,
    });
  const jumpToLatest = useChatLatestNavigation({
    cancelReveal,
    clearUnseenMessages,
    isHistoricalWindow,
    listRef,
    onJumpToLatest,
    scrollToLatestWindow,
  });
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
  const revealMessage = useCallback(
    (messageId: string) => {
      resetManualScroll();
      jumpToMessage(messageId);
    },
    [jumpToMessage, resetManualScroll],
  );
  const handleListScrollBeginDrag = useCallback(() => {
    handleScrollBeginDrag();
    cancelRevealOnDrag();
  }, [cancelRevealOnDrag, handleScrollBeginDrag]);
  const { giftedUser, renderMessage } = useChatMessageRenderer({
    currentUser,
    highlightedMessageId,
    isReadOnly,
    jumpToMessage: revealMessage,
    onRetryMessage: retryMessage,
    openMessageMenu,
  });
  const sendComposerText = useCallback(
    (text: string) => {
      handleInputChange('');
      setReplyingTo(null);
      handleSend([
        {
          _id: 'composer-draft',
          createdAt: new Date(),
          replyMessage: replyingTo ?? undefined,
          text,
          user: giftedUser,
        },
      ]);
    },
    [giftedUser, handleInputChange, handleSend, replyingTo, setReplyingTo],
  );

  return (
    <View style={styles.chat}>
      <KeyboardAvoidingView
        automaticOffset={false}
        behavior="translate-with-padding"
        keyboardVerticalOffset={topInset + CHAT_HEADER_HEIGHT}
        style={styles.chat}>
        <View style={styles.messagesContainer}>
          <ChatMessageList
            hasNewerMessages={hasNewerMessages}
            hasOlderMessages={hasOlderMessages}
            isLoadingNewerMessages={isLoadingNewerMessages}
            isLoadingOlderMessages={isLoadingOlderMessages}
            isReadOnly={isReadOnly}
            listRef={listRef}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            messages={giftedMessages}
            newerLoadFailed={newerLoadFailed}
            olderLoadFailed={olderLoadFailed}
            onLoadNewerMessages={onLoadNewerMessages}
            onLoadOlderMessages={requestOlderMessages}
            onScroll={handleScroll}
            onScrollBeginDrag={handleListScrollBeginDrag}
            renderMessage={renderMessage}
            showEmptyState={!messageLoading && !isLoadingOlderMessages && !isLoadingNewerMessages}
            startReply={startReply}
            typing={typingUsers.length > 0}
            user={giftedUser}
          />
          <ChatJumpToLatest
            isAlwaysVisible={isHistoricalWindow}
            isScrolledAway={isScrolledAway}
            newMessageCount={unseenMessageCount}
            onPress={jumpToLatest}
          />
        </View>
        {isReadOnly ? (
          <DeletedUserNotice />
        ) : (
          <ChatInputToolbar
            currentUserId={currentUserId}
            isEditing={editing !== null}
            onCancelEdit={stopEditingAndResetComposer}
            onChooseImages={handleChooseImages}
            onClearReply={() => setReplyingTo(null)}
            onSendText={sendComposerText}
            onSubmitEdit={submitEdit}
            replyMessage={replyingTo}
            text={composerText}
            textInputProps={{
              keyboardAppearance: theme,
              multiline: true,
              onContentSizeChange: handleContentSizeChange,
              onChangeText: handleInputChange,
              placeholder: 'Write a message…',
              placeholderTextColor: styles.placeholder.color,
              scrollEnabled: isComposerScrollable,
              style: [styles.composer, { height: composerHeight }],
            }}
          />
        )}
      </KeyboardAvoidingView>
      <ChatMessageLoadStatus
        failed={messageLoadFailed}
        loading={messageLoading}
        onRetry={retryMessageWindow}
      />
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
