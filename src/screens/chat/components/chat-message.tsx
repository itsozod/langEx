import * as Haptics from 'expo-haptics';
import { createContext, useCallback, useContext, useRef } from 'react';
import {
  Pressable as BubblePressable,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { LinkParser, type BubbleProps, type MessageProps } from 'react-native-gifted-chat';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle, withTiming, type SharedValue } from 'react-native-reanimated';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';
import type { GiftedMessage } from '../types';
import { formatMessageTime, isSameSenderOnSameDay } from '../utils/messages';

/**
 * Long-pressing message text has to be handled by the text itself. A gesture-handler pressable
 * wrapped around it cancels touches in its subviews on iOS, which stops links from ever opening,
 * so the long press is carried down to every text node instead of sitting above them.
 */
const MessageLongPressContext = createContext<(() => void) | undefined>(undefined);

function MessageText(props: TextProps) {
  const onLongPress = useContext(MessageLongPressContext);

  return <Text {...props} onLongPress={onLongPress} />;
}

/** Window coordinates of a bubble, so a menu can be placed against the message it belongs to. */
export type MessageAnchor = { height: number; width: number; x: number; y: number };

export type ChatMessageExtras = {
  highlightedMessageId?: SharedValue<string | null>;
  onJumpToMessage?: (messageId: string) => void;
  onOpenMenu?: (message: GiftedMessage, anchor: MessageAnchor) => void;
};

type BubbleHighlightProps = {
  cornerStyles: StyleProp<ViewStyle>;
  highlightedMessageId?: SharedValue<string | null>;
  messageId: string;
};

/** Flashes over the bubble that a tap on a reply quote just revealed. */
function BubbleHighlight({ cornerStyles, highlightedMessageId, messageId }: BubbleHighlightProps) {
  const styles = useChatStyles();

  const animatedStyle = useAnimatedStyle(() => {
    const isHighlighted = highlightedMessageId?.value === messageId;
    return {
      opacity: withTiming(isHighlighted ? 1 : 0, { duration: isHighlighted ? 160 : 420 }),
    };
  }, [messageId]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.bubbleHighlight, cornerStyles, animatedStyle]}
    />
  );
}

function ChatBubble(props: BubbleProps<GiftedMessage> & ChatMessageExtras) {
  const styles = useChatStyles();
  const { currentMessage, highlightedMessageId, nextMessage, position, previousMessage } = props;
  const joinsAbove = isSameSenderOnSameDay(currentMessage, previousMessage);
  const joinsBelow = isSameSenderOnSameDay(currentMessage, nextMessage);
  const replyMessage = currentMessage.replyMessage;
  const replyAuthor =
    String(replyMessage?.user._id) === String(props.user?._id)
      ? 'You'
      : replyMessage?.user.name || 'Language partner';
  const cornerStyles = [
    joinsAbove && (position === 'right' ? styles.bubbleJoinAboveRight : styles.bubbleJoinAboveLeft),
    joinsBelow && (position === 'right' ? styles.bubbleJoinBelowRight : styles.bubbleJoinBelowLeft),
  ];

  const bubbleRef = useRef<View>(null);
  const onOpenMenu = props.onOpenMenu;

  const jumpToRepliedMessage = useCallback(() => {
    if (replyMessage) props.onJumpToMessage?.(String(replyMessage._id));
  }, [props, replyMessage]);

  const openMenu = useCallback(() => {
    if (!onOpenMenu || currentMessage.pending) return;

    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      onOpenMenu(currentMessage, { height, width, x, y });
      void Haptics.selectionAsync().catch(() => {});
    });
  }, [currentMessage, onOpenMenu]);

  return (
    // React Native's pressable, not the gesture-handler one: it shares the responder system with
    // the message text, so a long press anywhere on the bubble opens the menu without stealing the
    // taps that open links.
    <BubblePressable
      ref={bubbleRef}
      onLongPress={openMenu}
      style={[
        styles.bubble,
        position === 'right' ? styles.bubbleRight : styles.bubbleLeft,
        cornerStyles,
      ]}>
      {replyMessage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Go to the message from ${replyAuthor}`}
          disabled={!props.onJumpToMessage}
          onPress={jumpToRepliedMessage}
          onLongPress={openMenu}
          style={({ pressed }) => [
            styles.messageReply,
            position === 'right' ? styles.messageReplyRight : styles.messageReplyLeft,
            pressed && styles.pressed,
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
        </Pressable>
      ) : null}
      <MessageLongPressContext.Provider value={openMenu}>
        <LinkParser
          text={currentMessage.text}
          TextComponent={MessageText}
          textStyle={position === 'right' ? styles.bubbleTextRight : styles.bubbleTextLeft}
          linkStyle={position === 'right' ? styles.bubbleLinkRight : styles.bubbleLinkLeft}
          phone={false}
          stripPrefix={false}
        />
      </MessageLongPressContext.Provider>
      <View style={styles.bubbleMeta}>
        {currentMessage.editedAt ? (
          <ThemedText
            style={[
              styles.editedLabel,
              position === 'right' ? styles.messageTimeRight : styles.messageTimeLeft,
            ]}>
            edited
          </ThemedText>
        ) : null}
        <ThemedText style={position === 'right' ? styles.messageTimeRight : styles.messageTimeLeft}>
          {formatMessageTime(currentMessage.createdAt)}
        </ThemedText>
        {position === 'right' && currentMessage.pending ? <View style={styles.pendingDot} /> : null}
      </View>
      <BubbleHighlight
        cornerStyles={cornerStyles}
        highlightedMessageId={highlightedMessageId}
        messageId={String(currentMessage._id)}
      />
    </BubblePressable>
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

export function ChatMessage(props: MessageProps<GiftedMessage> & ChatMessageExtras) {
  const styles = useChatStyles();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const joinsNext = isSameSenderOnSameDay(props.currentMessage, props.nextMessage);
  const canReply = Boolean(props.swipeToReply?.isEnabled && !props.currentMessage.pending);
  // Own messages sit on the right, so replying to them is a swipe towards their own side.
  const isOwnMessage = props.position === 'right';

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
        overshootFriction={8}
        onSwipeableWillOpen={handleReply}
        onSwipeableOpen={closeSwipeable}
        {...(isOwnMessage
          ? {
              rightThreshold: 36,
              dragOffsetFromRightEdge: 12,
              overshootRight: true,
              renderRightActions: () => <ReplySwipeAction />,
            }
          : {
              leftThreshold: 36,
              dragOffsetFromLeftEdge: 12,
              overshootLeft: true,
              renderLeftActions: () => <ReplySwipeAction />,
            })}
        containerStyle={[
          styles.messageSwipeable,
          props.position === 'right' ? styles.messageSwipeableRight : styles.messageSwipeableLeft,
        ]}>
        <ChatBubble {...props} />
      </ReanimatedSwipeable>
    </View>
  );
}
