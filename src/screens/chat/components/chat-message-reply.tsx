import { Image } from 'expo-image';
import { Pressable } from 'react-native-gesture-handler';
import { View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';
import type { GiftedReplyMessage } from '../types/message.types';

type ChatMessageReplyProps = {
  currentUserId?: string | number;
  onLongPress: () => void;
  onPress: () => void;
  position: 'left' | 'right';
  replyMessage: GiftedReplyMessage;
};

export function ChatMessageReply({
  currentUserId,
  onLongPress,
  onPress,
  position,
  replyMessage,
}: ChatMessageReplyProps) {
  const styles = useChatStyles();
  const author =
    String(replyMessage.user._id) === String(currentUserId)
      ? 'You'
      : replyMessage.user.name || 'Language partner';
  const isOwn = position === 'right';
  const images = replyMessage.chatImages ?? [];
  const thumbnail = images[0]?.thumbnailUrl ?? replyMessage.image;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Go to the message from ${author}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.messageReply,
        isOwn ? styles.messageReplyRight : styles.messageReplyLeft,
        pressed && styles.pressed,
      ]}>
      <View style={styles.messageReplyBody}>
        <View style={styles.messageReplyCopy}>
          <ThemedText
            numberOfLines={1}
            style={[
              styles.messageReplyAuthor,
              isOwn ? styles.messageReplyAuthorRight : styles.messageReplyAuthorLeft,
            ]}>
            {author}
          </ThemedText>
          <ThemedText
            numberOfLines={2}
            style={[
              styles.messageReplyText,
              isOwn ? styles.messageReplyTextRight : styles.messageReplyTextLeft,
            ]}>
            {replyMessage.text ||
              (thumbnail ? (images.length > 1 ? `${images.length} photos` : 'Photo') : 'Message')}
          </ThemedText>
        </View>
        {thumbnail ? (
          <View style={styles.replyThumbnailWrap}>
            <Image
              accessibilityLabel="Replied-to photo"
              cachePolicy="memory-disk"
              contentFit="cover"
              recyclingKey={`reply-${String(replyMessage._id)}`}
              source={{ uri: thumbnail }}
              style={styles.messageReplyThumbnail}
            />
            {images.length > 1 ? (
              <View style={styles.replyThumbnailBadge}>
                <ThemedText
                  style={styles.replyThumbnailBadgeText}>{`+${images.length - 1}`}</ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
