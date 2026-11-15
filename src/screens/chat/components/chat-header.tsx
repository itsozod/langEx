import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatHeaderStyles } from '../styles/chat-header-styles';
import type { ChatParticipant, UserPresence } from '../types/message.types';
import { getInitials } from '../utils/messages';
import { useTranslation } from 'react-i18next';
import i18n from '@/shared/i18n';

type ChatHeaderProps = {
  conversationName?: string | null;
  isGroup: boolean;
  participantCount: number;
  participant?: ChatParticipant;
  onBack: () => void;
  onDelete: () => void;
  onOpenProfile: () => void;
  deletePending: boolean;
  presence?: UserPresence;
  presencePending: boolean;
  presenceUnavailable: boolean;
};

export function ChatHeader({
  conversationName,
  isGroup,
  participantCount,
  participant,
  onBack,
  onDelete,
  onOpenProfile,
  deletePending,
  presence,
  presencePending,
  presenceUnavailable,
}: ChatHeaderProps) {
  const styles = useChatHeaderStyles();
  const { t } = useTranslation(['chat', 'common', 'discover', 'groups']);
  const [now, setNow] = useState(() => Date.now());
  const name = isGroup
    ? conversationName?.trim() || t('groups:fallbackName')
    : participant?.isDeleted
      ? t('common:deletedUser')
      : participant?.displayName?.trim() || t('discover:fallbackName');
  const presenceLabel = isGroup
    ? t('groups:info.memberCount', { count: participantCount })
    : participant?.isDeleted
      ? t('presence.accountDeleted')
      : presencePending
        ? t('presence.checking')
        : presenceUnavailable
          ? t('presence.unavailable')
          : formatPresenceLabel(presence, now);

  useEffect(() => {
    if (isGroup || !presence || presence.isOnline) return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [isGroup, presence]);

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('backToChats')}
        hitSlop={10}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
          size={22}
          weight="semibold"
          tintColor={styles.headerIcon.color}
        />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isGroup ? t('header.viewGroup', { name }) : t('discover:viewProfile', { name })
        }
        disabled={!isGroup && !participant?.id}
        hitSlop={4}
        onPress={onOpenProfile}
        style={({ pressed }) => [styles.headerProfileButton, pressed && styles.pressed]}>
        <View style={styles.headerAvatarWrap}>
          {isGroup ? (
            <View style={styles.groupAvatarPlaceholder}>
              <SymbolView
                name={{ ios: 'person.3.fill', android: 'group', web: 'group' }}
                size={21}
                weight="semibold"
                tintColor={styles.groupAvatarIcon.color}
              />
            </View>
          ) : participant?.avatarUrl ? (
            <Image
              source={{ uri: participant.avatarUrl }}
              contentFit="cover"
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <ThemedText type="bold" style={styles.initials}>
                {getInitials(name)}
              </ThemedText>
            </View>
          )}
          {!isGroup && participant?.country ? (
            <View style={styles.headerCountryBadge}>
              <CountryFlag country={participant.country} size={11} boxSize={16} />
            </View>
          ) : null}
        </View>
        <View style={styles.headerCopy}>
          <ThemedText type="bold" numberOfLines={1} style={styles.headerName}>
            {name}
          </ThemedText>
          <View
            accessibilityLabel={presenceLabel}
            accessibilityRole="text"
            style={styles.presenceRow}>
            {!isGroup && presence?.isOnline && !participant?.isDeleted ? (
              <View style={styles.onlineDot} />
            ) : null}
            <ThemedText
              numberOfLines={1}
              style={[
                styles.onlineText,
                !isGroup && presence?.isOnline && styles.onlineTextActive,
              ]}>
              {presenceLabel}
            </ThemedText>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isGroup ? t('header.deleteGroup', { name }) : t('header.deleteDirect', { name })
        }
        accessibilityState={{ busy: deletePending, disabled: deletePending }}
        disabled={deletePending}
        hitSlop={4}
        onPress={onDelete}
        style={({ pressed }) => [styles.deleteConversationButton, pressed && styles.pressed]}>
        {deletePending ? (
          <ActivityIndicator size="small" color={styles.deleteConversationIcon.color} />
        ) : (
          <SymbolView
            name={{ ios: 'trash', android: 'delete', web: 'delete' }}
            size={19}
            weight="semibold"
            tintColor={styles.deleteConversationIcon.color}
          />
        )}
      </Pressable>
    </View>
  );
}

function formatPresenceLabel(presence: UserPresence | undefined, now: number) {
  if (presence?.isOnline) return i18n.t('common:status.online');
  if (!presence?.lastSeenAt) return i18n.t('common:status.offline');

  const lastSeen = new Date(presence.lastSeenAt);
  if (Number.isNaN(lastSeen.getTime())) return i18n.t('common:status.offline');
  const elapsedMinutes = Math.max(0, Math.floor((now - lastSeen.getTime()) / 60_000));
  if (elapsedMinutes < 1) return i18n.t('chat:presence.justNow');
  if (elapsedMinutes < 60) return i18n.t('chat:presence.minutesAgo', { count: elapsedMinutes });

  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(today.getDate() - 1);
  const locale = i18n.language;
  const time = lastSeen.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  if (isSameDay(lastSeen, today)) return i18n.t('chat:presence.today', { time });
  if (isSameDay(lastSeen, yesterday)) return i18n.t('chat:presence.yesterday', { time });

  return i18n.t('chat:presence.date', {
    date: lastSeen.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
  });
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}
