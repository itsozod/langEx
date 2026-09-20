import {
  FlashList,
  type FlashListProps,
  type FlashListRef,
  type ListRenderItem,
} from '@shopify/flash-list';
import {
  memo,
  useCallback,
  useMemo,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Platform, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Day, type MessageProps, type User } from 'react-native-gifted-chat';

import { useChatStyles } from '../styles/chat-styles';
import type { GiftedMessage } from '../types/message.types';
import { ChatEmptyState } from './chat-thread-states';
import { ChatTypingIndicator } from './chat-typing-indicator';
import { NewerMessagesLoader, OlderMessagesLoader } from './older-messages-loader';

type ChatMessageListProps = {
  hasNewerMessages: boolean;
  hasOlderMessages: boolean;
  isLoadingNewerMessages: boolean;
  isLoadingOlderMessages: boolean;
  isReadOnly: boolean;
  listRef: RefObject<FlashListRef<GiftedMessage> | null>;
  maintainVisibleContentPosition: NonNullable<
    FlashListProps<GiftedMessage>['maintainVisibleContentPosition']
  >;
  messages: GiftedMessage[];
  newerLoadFailed: boolean;
  olderLoadFailed: boolean;
  onLoadNewerMessages: () => void;
  onLoadOlderMessages: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollBeginDrag: () => void;
  renderMessage: (props: MessageProps<GiftedMessage>) => ReactNode;
  showEmptyState: boolean;
  startReply: (message: GiftedMessage) => void;
  typing: boolean;
  user: User;
};

function messageKey(message: GiftedMessage) {
  return String(message._id);
}

function getMessageType(message: GiftedMessage) {
  if (message.chatImages?.length) return 'gallery';
  if (message.replyMessage) return 'reply';
  return 'text';
}

function isSameMessageDay(first?: GiftedMessage, second?: GiftedMessage) {
  if (!first || !second) return false;
  const firstDate = new Date(first.createdAt);
  const secondDate = new Date(second.createdAt);
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function ChatMessageListComponent({
  hasNewerMessages,
  hasOlderMessages,
  isLoadingNewerMessages,
  isLoadingOlderMessages,
  isReadOnly,
  listRef,
  maintainVisibleContentPosition,
  messages,
  newerLoadFailed,
  olderLoadFailed,
  onLoadNewerMessages,
  onLoadOlderMessages,
  onScroll,
  onScrollBeginDrag,
  renderMessage,
  showEmptyState,
  startReply,
  typing,
  user,
}: ChatMessageListProps) {
  const styles = useChatStyles();
  const swipeToReply = useMemo(
    () => ({ isEnabled: !isReadOnly, direction: 'right' as const, onSwipe: startReply }),
    [isReadOnly, startReply],
  );
  const renderItem = useCallback<ListRenderItem<GiftedMessage>>(
    ({ item, index }) => {
      const previousMessage = messages[index - 1];
      const message = renderMessage({
        currentMessage: item,
        // The data is chronological: the older neighbour is visually above and the newer one is
        // below. These relationships preserve the existing grouped-bubble corner semantics.
        previousMessage,
        nextMessage: messages[index + 1],
        position: String(item.user._id) === String(user._id) ? 'right' : 'left',
        user,
        isInverted: false,
        swipeToReply,
      }) as ReactElement;

      return (
        <View>
          {!isSameMessageDay(item, previousMessage) ? <Day createdAt={item.createdAt} /> : null}
          {message}
        </View>
      );
    },
    [messages, renderMessage, swipeToReply, user],
  );
  const header = useMemo(
    () =>
      hasOlderMessages || isLoadingOlderMessages || olderLoadFailed ? (
        <OlderMessagesLoader
          hasError={olderLoadFailed}
          isLoading={isLoadingOlderMessages}
          onPress={onLoadOlderMessages}
        />
      ) : null,
    [hasOlderMessages, isLoadingOlderMessages, olderLoadFailed, onLoadOlderMessages],
  );
  const footer = useMemo(
    () => (
      <View>
        {hasNewerMessages || isLoadingNewerMessages || newerLoadFailed ? (
          <NewerMessagesLoader
            hasError={newerLoadFailed}
            isLoading={isLoadingNewerMessages}
            onPress={onLoadNewerMessages}
          />
        ) : null}
        {typing ? <ChatTypingIndicator /> : null}
      </View>
    ),
    [hasNewerMessages, isLoadingNewerMessages, newerLoadFailed, onLoadNewerMessages, typing],
  );

  return (
    <FlashList
      ref={listRef}
      contentContainerStyle={styles.messageList}
      data={messages}
      drawDistance={Platform.OS === 'android' ? 480 : 720}
      getItemType={getMessageType}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="always"
      keyExtractor={messageKey}
      ListEmptyComponent={showEmptyState ? <ChatEmptyState /> : null}
      ListFooterComponent={footer}
      ListHeaderComponent={header}
      maintainVisibleContentPosition={maintainVisibleContentPosition}
      onEndReached={hasNewerMessages ? onLoadNewerMessages : undefined}
      onEndReachedThreshold={0.2}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onStartReached={hasOlderMessages ? onLoadOlderMessages : undefined}
      onStartReachedThreshold={0.2}
      renderItem={renderItem}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={styles.messagesContainer}
    />
  );
}

// Composer keystrokes re-render ChatThread, but none of them should enter the recycled viewport.
export const ChatMessageList = memo(ChatMessageListComponent);
