import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatsStyles } from '../styles/chats-styles';
import type { ChatParticipant, Conversation } from '../types/message.types';
import { formatMessageSystemEvent } from '../utils/system-events';

function initials(name?: string | null) {
  const value = name?.trim() || 'Language partner';
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatTimestamp(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return isToday
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
      });
}

export function getOtherParticipant(conversation: Conversation, currentUserId?: string) {
  return (
    conversation.participants.find((participant) => participant.id !== currentUserId) ??
    conversation.participants[0]
  );
}

type ConversationRowProps = {
  conversation: Conversation;
  currentUserId?: string;
  participant?: ChatParticipant;
  onOpenProfile: () => void;
  onPress: () => void;
};

export function ConversationRow({
  conversation,
  currentUserId,
  participant,
  onOpenProfile,
  onPress,
}: ConversationRowProps) {
  const styles = useChatsStyles();
  const isGroup = conversation.type === 'GROUP';
  const name = isGroup
    ? conversation.name?.trim() || 'Group conversation'
    : participant?.displayName?.trim() || 'Language partner';
  const onlineLabel = !isGroup && participant?.isOnline ? ', online' : '';
  const systemPreview =
    conversation.lastMessageKind === 'GROUP_MEMBER_ADDED'
      ? formatMessageSystemEvent(conversation.lastMessageSystemEvent, currentUserId)
      : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${name}${onlineLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isGroup ? `View ${name} group info` : `View ${name}'s profile${onlineLabel}`
        }
        disabled={!isGroup && !participant?.id}
        hitSlop={5}
        onPress={(event) => {
          event.stopPropagation();
          onOpenProfile();
        }}
        style={({ pressed }) => [styles.avatarWrap, pressed && styles.avatarPressed]}>
        {isGroup ? (
          <View style={styles.groupAvatarPlaceholder}>
            <SymbolView
              name={{ ios: 'person.3.fill', android: 'group', web: 'group' }}
              size={24}
              weight="semibold"
              tintColor={styles.groupAvatarIcon.color}
            />
          </View>
        ) : participant?.avatarUrl ? (
          <Image source={{ uri: participant.avatarUrl }} contentFit="cover" style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ThemedText type="bold" style={styles.initials}>
              {initials(name)}
            </ThemedText>
          </View>
        )}
        {!isGroup && participant?.isOnline ? (
          <View
            accessibilityLabel={`${name} is online`}
            accessibilityRole="image"
            style={styles.onlineDot}
          />
        ) : null}
        {!isGroup && participant?.country ? (
          <View pointerEvents="none" style={styles.countryBadge}>
            <CountryFlag country={participant.country} size={14} boxSize={19} />
          </View>
        ) : null}
      </Pressable>

      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <ThemedText type="bold" numberOfLines={1} style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.timestamp}>
            {formatTimestamp(conversation.lastMessageTimestamp)}
          </ThemedText>
        </View>
        <View style={styles.rowBottom}>
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.preview}>
            {systemPreview ||
              conversation.lastMessagePreview ||
              (isGroup
                ? `${conversation.participants.length} members · Start the conversation`
                : 'Start the conversation')}
          </ThemedText>
          {typeof conversation.unreadCount === 'number' && conversation.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadText}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function ConversationSkeleton() {
  const styles = useChatsStyles();
  return (
    <View style={styles.skeletonRow}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonCopy}>
        <View style={styles.skeletonName} />
        <View style={styles.skeletonPreview} />
      </View>
    </View>
  );
}
