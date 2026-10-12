import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatPinnedSheet } from '../hooks/use-chat-pinned-sheet';
import { useChatPinnedStyles } from '../styles/chat-pinned-styles';
import type { ChatParticipant, Message } from '../types/message.types';
import { ChatPinnedMessageActions } from './chat-pinned-message-actions';

type ChatPinnedMessagesProps = {
  currentUserId?: string;
  isReadOnly: boolean;
  messages: Message[];
  onDeleteMessage: (messageId: string, fallbackMessage?: Message) => void;
  onJumpToMessage: (messageId: string) => void;
  onUnpinMessage: (messageId: string) => void;
  participants: ChatParticipant[];
  unpinPending: boolean;
};

function messagePreview(message: Message) {
  const text = message.content.trim().replace(/\s+/g, ' ');
  if (text) return text;
  const imageCount = message.images?.length ?? Number(Boolean(message.image));
  return imageCount > 1 ? `${imageCount} photos` : 'Photo';
}

export function ChatPinnedMessages({
  currentUserId,
  isReadOnly,
  messages,
  onDeleteMessage,
  onJumpToMessage,
  onUnpinMessage,
  participants,
  unpinPending,
}: ChatPinnedMessagesProps) {
  const styles = useChatPinnedStyles();
  const { height: windowHeight } = useWindowDimensions();
  const [currentMessageId, setCurrentMessageId] = useState<string>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const currentIndex = Math.max(
    0,
    messages.findIndex((message) => message.id === currentMessageId),
  );
  const currentMessage = messages[currentIndex];
  const participantNames = useMemo(
    () => new Map(participants.map((participant) => [participant.id, participant.displayName])),
    [participants],
  );

  if (!currentMessage) return null;

  const jumpAndAdvance = () => {
    onJumpToMessage(currentMessage.id);
    setCurrentMessageId(messages[(currentIndex + 1) % messages.length].id);
  };
  const jumpFromSheet = (message: Message) => {
    setSheetOpen(false);
    setCurrentMessageId(message.id);
    onJumpToMessage(message.id);
  };
  const senderName = (message: Message) =>
    message.senderId === currentUserId
      ? 'You'
      : participantNames.get(message.senderId)?.trim() || 'Chat partner';

  return (
    <>
      <View style={styles.banner}>
        <Pressable
          accessibilityHint="Jumps to this message and selects the next pinned message"
          accessibilityLabel={`Pinned message ${currentIndex + 1} of ${messages.length}`}
          accessibilityRole="button"
          onPress={jumpAndAdvance}
          style={styles.bannerMain}>
          <View style={styles.bannerAccent} />
          <View style={styles.bannerCopy}>
            <ThemedText numberOfLines={1} style={styles.bannerTitle}>
              {messages.length === 1
                ? 'Pinned Message'
                : `Pinned Message ${currentIndex + 1} of ${messages.length}`}
            </ThemedText>
            <ThemedText numberOfLines={1} style={styles.bannerPreview}>
              {senderName(currentMessage)}: {messagePreview(currentMessage)}
            </ThemedText>
          </View>
        </Pressable>
        <Pressable
          accessibilityLabel={`Open all ${messages.length} pinned messages`}
          accessibilityRole="button"
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [styles.bannerButton, pressed && styles.bannerButtonPressed]}>
          <SymbolView
            name={{ ios: 'pin.fill', android: 'push_pin', web: 'push_pin' }}
            size={22}
            tintColor={styles.bannerIcon.color}
          />
          {messages.length > 1 ? (
            <View style={styles.countBadge}>
              <ThemedText style={styles.countText}>{messages.length}</ThemedText>
            </View>
          ) : null}
        </Pressable>
      </View>

      {sheetOpen ? (
        <PinnedMessagesSheet
          currentUserId={currentUserId}
          isReadOnly={isReadOnly}
          messages={messages}
          onClose={() => setSheetOpen(false)}
          onDeleteMessage={onDeleteMessage}
          onJumpToMessage={jumpFromSheet}
          onUnpinMessage={onUnpinMessage}
          participantNames={participantNames}
          unpinPending={unpinPending}
          windowHeight={windowHeight}
        />
      ) : null}
    </>
  );
}

type PinnedMessagesSheetProps = {
  currentUserId?: string;
  isReadOnly: boolean;
  messages: Message[];
  onClose: () => void;
  onDeleteMessage: (messageId: string, fallbackMessage?: Message) => void;
  onJumpToMessage: (message: Message) => void;
  onUnpinMessage: (messageId: string) => void;
  participantNames: Map<string, string | null>;
  unpinPending: boolean;
  windowHeight: number;
};

function PinnedMessagesSheet({
  currentUserId,
  isReadOnly,
  messages,
  onClose,
  onDeleteMessage,
  onJumpToMessage,
  onUnpinMessage,
  participantNames,
  unpinPending,
  windowHeight,
}: PinnedMessagesSheetProps) {
  const styles = useChatPinnedStyles();
  const insets = useSafeAreaInsets();
  const [actionMessage, setActionMessage] = useState<Message | null>(null);
  const sheetHeight = Math.min(
    Math.round(windowHeight * 0.78),
    Math.max(
      320,
      124 + messages.length * 86 + Math.max(0, messages.length - 1) * 10 + insets.bottom,
    ),
  );
  const { backdropAnimatedStyle, close, dragGesture, sheetAnimatedStyle } = useChatPinnedSheet({
    onClose,
    sheetHeight,
  });
  const senderName = (message: Message) =>
    message.senderId === currentUserId
      ? 'You'
      : participantNames.get(message.senderId)?.trim() || 'Chat partner';
  const dismissTopLayer = actionMessage ? () => setActionMessage(null) : close;

  return (
    <Modal
      animationType="none"
      hardwareAccelerated
      navigationBarTranslucent
      onRequestClose={dismissTopLayer}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible>
      <GestureHandlerRootView style={styles.modalRoot}>
        <Animated.View style={[styles.sheetBackdrop, backdropAnimatedStyle]}>
          <Pressable
            accessibilityLabel="Close pinned messages"
            accessibilityRole="button"
            onPress={close}
            style={styles.sheetBackdropPressable}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          onAccessibilityEscape={dismissTopLayer}
          style={[styles.sheetSurface, { height: sheetHeight }, sheetAnimatedStyle]}
          testID="pinned-messages-sheet">
          <GestureDetector gesture={dragGesture}>
            <View accessibilityLabel="Swipe down to close" style={styles.sheetHandleArea}>
              <View style={styles.sheetHandle} />
            </View>
          </GestureDetector>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderCopy}>
              <ThemedText style={styles.sheetTitle}>Pinned messages</ThemedText>
              <ThemedText numberOfLines={1} style={styles.sheetSubtitle}>
                {messages.length === 1
                  ? '1 message saved in this chat'
                  : `${messages.length} messages saved in this chat`}
              </ThemedText>
            </View>
            <Pressable
              accessibilityLabel="Close pinned messages"
              accessibilityRole="button"
              onPress={close}
              style={({ pressed }) => [
                styles.sheetDoneButton,
                pressed && styles.sheetButtonPressed,
              ]}>
              <ThemedText style={styles.sheetDoneLabel}>Done</ThemedText>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={[
              styles.sheetListContent,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
            style={styles.sheetList}
            testID="pinned-messages-list">
            {messages.map((message, index) => (
              <Pressable
                accessibilityHint="Tap to jump to this message. Touch and hold for actions"
                accessibilityLabel={`${senderName(message)}: ${messagePreview(message)}`}
                accessibilityRole="button"
                key={message.id}
                onLongPress={() => {
                  setActionMessage(message);
                  void Haptics.selectionAsync().catch(() => {});
                }}
                onPress={() => onJumpToMessage(message)}
                style={({ pressed }) => [
                  styles.sheetMessage,
                  pressed && styles.sheetMessagePressed,
                ]}
                testID={`pinned-message-${message.id}`}>
                <View style={styles.sheetMessageAccent} />
                <View style={styles.sheetMessageCopy}>
                  <View style={styles.sheetMessageMeta}>
                    <ThemedText numberOfLines={1} style={styles.sheetAuthor}>
                      {senderName(message)}
                    </ThemedText>
                    <ThemedText
                      style={styles.sheetIndex}>{`${index + 1}/${messages.length}`}</ThemedText>
                  </View>
                  <ThemedText numberOfLines={2} style={styles.sheetPreview}>
                    {messagePreview(message)}
                  </ThemedText>
                </View>
                <View style={styles.sheetPinBox}>
                  <SymbolView
                    name={{ ios: 'pin.fill', android: 'push_pin', web: 'push_pin' }}
                    size={18}
                    tintColor={styles.sheetPinIcon.color}
                  />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
        {actionMessage ? (
          <ChatPinnedMessageActions
            canDelete={actionMessage.senderId === currentUserId}
            canModify={!isReadOnly}
            message={actionMessage}
            onClose={() => setActionMessage(null)}
            onDelete={onDeleteMessage}
            onUnpin={onUnpinMessage}
            unpinPending={unpinPending}
          />
        ) : null}
      </GestureHandlerRootView>
    </Modal>
  );
}
