import { Pressable, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { ContactAvatar } from '@/shared/components/ui/contact-avatar';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatsStyles } from '../styles/chats-styles';
import type { ChatParticipant, Conversation } from '../types/message.types';
import { formatMessageSystemEvent } from '../utils/system-events';
import { useTranslation } from 'react-i18next';
import i18n from '@/shared/i18n';

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
    ? date.toLocaleTimeString(i18n.language, { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString(i18n.language, {
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
  const { t } = useTranslation(['chat', 'discover', 'groups']);
  const isGroup = conversation.type === 'GROUP';
  const name = isGroup
    ? conversation.name?.trim() || t('groups:fallbackName')
    : participant?.displayName?.trim() || t('discover:fallbackName');
  const isOnline = !isGroup && Boolean(participant?.isOnline);
  const systemPreview =
    conversation.lastMessageKind === 'GROUP_MEMBER_ADDED'
      ? formatMessageSystemEvent(conversation.lastMessageSystemEvent, currentUserId)
      : '';

  const isDeletedUser = !isGroup && Boolean(participant?.isDeleted);
  const unreadCount = typeof conversation.unreadCount === 'number' ? conversation.unreadCount : 0;
  const hasUnread = unreadCount > 0;
  const preview =
    systemPreview ||
    conversation.lastMessagePreview ||
    (isGroup ? t('row.groupStart', { count: conversation.participants.length }) : t('row.start'));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isOnline ? t('row.openOnline', { name }) : t('row.open', { name })}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isGroup
            ? t('header.viewGroup', { name })
            : isOnline
              ? t('row.viewProfileOnline', { name })
              : t('discover:viewProfile', { name })
        }
        disabled={!isGroup && !participant?.id}
        hitSlop={5}
        onPress={(event) => {
          event.stopPropagation();
          onOpenProfile();
        }}
        style={({ pressed }) => [styles.avatarWrap, pressed && styles.avatarPressed]}>
        <ContactAvatar
          avatarUrl={participant?.avatarUrl}
          isOnline={isOnline}
          name={name}
          variant={isGroup ? 'group' : isDeletedUser ? 'deleted' : 'person'}
        />
      </Pressable>

      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <View style={styles.nameGroup}>
            <ThemedText numberOfLines={1} style={[styles.name, hasUnread && styles.nameUnread]}>
              {name}
            </ThemedText>
            {!isGroup && participant?.country ? (
              <CountryFlag country={participant.country} size={14} boxSize={16} />
            ) : null}
          </View>
          <ThemedText style={[styles.timestamp, hasUnread && styles.timestampUnread]}>
            {formatTimestamp(conversation.lastMessageTimestamp)}
          </ThemedText>
        </View>
        <View style={styles.rowBottom}>
          <ThemedText numberOfLines={1} style={[styles.preview, hasUnread && styles.previewUnread]}>
            {preview}
          </ThemedText>
          {hasUnread ? (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadText}>
                {unreadCount > 99 ? '99+' : unreadCount}
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
      <Skeleton style={styles.skeletonAvatar} />
      <View style={styles.skeletonCopy}>
        <Skeleton style={styles.skeletonName} />
        <Skeleton style={styles.skeletonPreview} />
      </View>
    </View>
  );
}
