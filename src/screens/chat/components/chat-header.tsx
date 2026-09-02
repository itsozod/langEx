import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatHeaderStyles } from '../styles/chat-header-styles';
import type { ChatParticipant, UserPresence } from '../types/message.types';
import { getInitials } from '../utils/messages';

type ChatHeaderProps = {
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
  const [now, setNow] = useState(() => Date.now());
  const name = participant?.isDeleted
    ? 'Deleted user'
    : participant?.displayName?.trim() || 'Language partner';
  const presenceLabel = participant?.isDeleted
    ? 'Account deleted'
    : presencePending
      ? 'Checking status…'
      : presenceUnavailable
        ? 'Presence unavailable'
        : formatPresenceLabel(presence, now);

  useEffect(() => {
    if (!presence || presence.isOnline) return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [presence]);

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to chats"
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
        accessibilityLabel={`View ${name}'s profile`}
        disabled={!participant?.id}
        hitSlop={4}
        onPress={onOpenProfile}
        style={({ pressed }) => [styles.headerProfileButton, pressed && styles.pressed]}>
        <View style={styles.headerAvatarWrap}>
          {participant?.avatarUrl ? (
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
          {participant?.country ? (
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
            {presence?.isOnline && !participant?.isDeleted ? (
              <View style={styles.onlineDot} />
            ) : null}
            <ThemedText
              numberOfLines={1}
              style={[styles.onlineText, presence?.isOnline && styles.onlineTextActive]}>
              {presenceLabel}
            </ThemedText>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete conversation with ${name}`}
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
  if (presence?.isOnline) return 'Online';
  if (!presence?.lastSeenAt) return 'Offline';

  const lastSeen = new Date(presence.lastSeenAt);
  if (Number.isNaN(lastSeen.getTime())) return 'Offline';
  const elapsedMinutes = Math.max(0, Math.floor((now - lastSeen.getTime()) / 60_000));
  if (elapsedMinutes < 1) return 'Last seen just now';
  if (elapsedMinutes < 60) return `Last seen ${elapsedMinutes}m ago`;

  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(today.getDate() - 1);
  const time = lastSeen.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isSameDay(lastSeen, today)) return `Last seen today at ${time}`;
  if (isSameDay(lastSeen, yesterday)) return `Last seen yesterday at ${time}`;

  return `Last seen ${lastSeen.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}
