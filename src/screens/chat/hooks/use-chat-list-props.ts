import { useMemo } from 'react';
import { Platform } from 'react-native';
import type { GiftedChat } from 'react-native-gifted-chat';

import type { GiftedMessage } from '../types/message.types';

const MESSAGE_LIST_WINDOW_SIZE = 7;
const MESSAGE_RENDER_BATCH_SIZE = 8;

type ChatListProps = NonNullable<Parameters<typeof GiftedChat<GiftedMessage>>[0]['listProps']>;

type UseChatListPropsOptions = {
  contentContainerStyle: ChatListProps['contentContainerStyle'];
  maintainVisibleContentPosition: ChatListProps['maintainVisibleContentPosition'];
  onMomentumScrollEnd: ChatListProps['onMomentumScrollEnd'];
  onScrollBeginDrag: ChatListProps['onScrollBeginDrag'];
  onScroll: ChatListProps['onScroll'];
  onScrollToIndexFailed: ChatListProps['onScrollToIndexFailed'];
};

export function useChatListProps({
  contentContainerStyle,
  maintainVisibleContentPosition,
  onMomentumScrollEnd,
  onScrollBeginDrag,
  onScroll,
  onScrollToIndexFailed,
}: UseChatListPropsOptions): ChatListProps {
  return useMemo(
    () => ({
      contentContainerStyle,
      initialNumToRender: 12,
      keyboardShouldPersistTaps: 'handled',
      maintainVisibleContentPosition,
      maxToRenderPerBatch: MESSAGE_RENDER_BATCH_SIZE,
      onMomentumScrollEnd,
      onScrollBeginDrag,
      onScroll,
      onScrollToIndexFailed,
      removeClippedSubviews: Platform.OS === 'android',
      updateCellsBatchingPeriod: 40,
      windowSize: MESSAGE_LIST_WINDOW_SIZE,
    }),
    [
      contentContainerStyle,
      maintainVisibleContentPosition,
      onMomentumScrollEnd,
      onScrollBeginDrag,
      onScroll,
      onScrollToIndexFailed,
    ],
  );
}
