import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import type { BubbleProps, MessageProps } from 'react-native-gifted-chat';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';
import type { GiftedMessage } from '../types';
import { formatMessageTime, isSameSenderOnSameDay } from '../utils/messages';

function ChatBubble(props: BubbleProps<GiftedMessage>) {
  const styles = useChatStyles();
  const { currentMessage, nextMessage, position, previousMessage } = props;
  const joinsAbove = isSameSenderOnSameDay(currentMessage, previousMessage);
  const joinsBelow = isSameSenderOnSameDay(currentMessage, nextMessage);
  const replyMessage = currentMessage.replyMessage;
  const replyAuthor =
    String(replyMessage?.user._id) === String(props.user?._id)
      ? 'You'
      : replyMessage?.user.name || 'Language partner';

  return (
    <View
      style={[
        styles.bubble,
        position === 'right' ? styles.bubbleRight : styles.bubbleLeft,
        joinsAbove &&
          (position === 'right' ? styles.bubbleJoinAboveRight : styles.bubbleJoinAboveLeft),
        joinsBelow &&
          (position === 'right' ? styles.bubbleJoinBelowRight : styles.bubbleJoinBelowLeft),
      ]}>
      {replyMessage ? (
        <View
          style={[
            styles.messageReply,
            position === 'right' ? styles.messageReplyRight : styles.messageReplyLeft,
          ]}>
          <ThemedText
            numberOfLines={1}
            style={[
              styles.messageReplyAuthor,
              position === 'right' ? styles.messageReplyAuthorRight : styles.messageReplyAuthorLeft,
            ]}>
            {replyAuthor}
          </ThemedText>
          <ThemedText
            numberOfLines={2}
            style={[
              styles.messageReplyText,
              position === 'right' ? styles.messageReplyTextRight : styles.messageReplyTextLeft,
            ]}>
            {replyMessage.text}
          </ThemedText>
        </View>
      ) : null}
      <ThemedText style={position === 'right' ? styles.bubbleTextRight : styles.bubbleTextLeft}>
        {currentMessage.text}
      </ThemedText>
      <View style={styles.bubbleMeta}>
        <ThemedText style={position === 'right' ? styles.messageTimeRight : styles.messageTimeLeft}>
          {formatMessageTime(currentMessage.createdAt)}
        </ThemedText>
        {position === 'right' && currentMessage.pending ? <View style={styles.pendingDot} /> : null}
      </View>
    </View>
  );
}

export function ReplySwipeAction() {
  const styles = useChatStyles();

  return (
    <View style={styles.replySwipeAction}>
      <View style={styles.replySwipeIcon}>
        <SymbolView
          name={{ ios: 'arrowshape.turn.up.left.fill', android: 'reply', web: 'reply' }}
          size={17}
          weight="semibold"
          tintColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

export function ChatMessage(props: MessageProps<GiftedMessage>) {
  const styles = useChatStyles();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const joinsNext = isSameSenderOnSameDay(props.currentMessage, props.nextMessage);
  const canReply = Boolean(props.swipeToReply?.isEnabled && !props.currentMessage.pending);

  const handleReply = useCallback(() => {
    if (canReply) props.swipeToReply?.onSwipe?.(props.currentMessage);
  }, [canReply, props.currentMessage, props.swipeToReply]);
  const closeSwipeable = useCallback(() => swipeableRef.current?.close(), []);

  return (
    <View
      onLayout={props.onMessageLayout}
      style={[
        styles.messageLane,
        joinsNext ? styles.messageRowGrouped : styles.messageRowSeparated,
      ]}>
      <ReanimatedSwipeable
        ref={swipeableRef}
        enabled={canReply}
        friction={2}
        leftThreshold={36}
        dragOffsetFromLeftEdge={12}
        overshootLeft
        overshootFriction={8}
        onSwipeableWillOpen={handleReply}
        onSwipeableOpen={closeSwipeable}
        renderLeftActions={() => <ReplySwipeAction />}
        containerStyle={[
          styles.messageSwipeable,
          props.position === 'right' ? styles.messageSwipeableRight : styles.messageSwipeableLeft,
        ]}>
        <ChatBubble {...props} />
      </ReanimatedSwipeable>
    </View>
  );
}
