import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatSearchStyles } from '../styles/chat-search-styles';
import type { ChatParticipant, Conversation } from '../types/message.types';
import { getInitials } from '../utils/messages';
import { splitSearchMatch } from '../utils/search-match';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';

type ChatSearchResultRowProps = {
  conversation: Conversation;
  participant?: ChatParticipant;
  search: string;
  onOpenChat: () => void;
  onOpenProfile: () => void;
};

export function ChatSearchResultRow({
  conversation,
  participant,
  search,
  onOpenChat,
  onOpenProfile,
}: ChatSearchResultRowProps) {
  const styles = useChatSearchStyles();
  const { t } = useTranslation(['chat', 'common', 'discover', 'groups']);
  const isGroup = conversation.type === 'GROUP';
  const isDeleted = !isGroup && Boolean(participant?.isDeleted);
  const name = isGroup
    ? conversation.name?.trim() || t('groups:fallbackName')
    : isDeleted
      ? t('common:deletedUser')
      : participant?.displayName?.trim() || t('discover:fallbackName');
  const isOnline = !isGroup && Boolean(participant?.isOnline);
  const meta = isGroup
    ? t('groups:info.memberCount', { count: conversation.participants.length })
    : conversation.lastMessagePreview || (isOnline ? t('common:status.online') : t('row.start'));
  const canOpenProfile = isGroup || Boolean(participant?.id && !isDeleted);
  const { before, match, after } = splitSearchMatch(name, search);

  return (
    <Pressable
      accessibilityLabel={t('row.open', { name })}
      accessibilityRole="button"
      onPress={onOpenChat}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.avatarWrap}>
        {isGroup ? (
          <View style={[styles.avatarPlaceholder, styles.groupAvatar]}>
            <SymbolView
              name={{ ios: 'person.3.fill', android: 'group', web: 'group' }}
              size={21}
              weight="semibold"
              tintColor={styles.avatarIcon.color}
            />
          </View>
        ) : participant?.avatarUrl ? (
          <Image source={{ uri: participant.avatarUrl }} contentFit="cover" style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ThemedText type="bold" style={styles.initials}>
              {getInitials(name)}
            </ThemedText>
          </View>
        )}
        {isOnline ? <View style={styles.onlineDot} /> : null}
        {!isGroup && participant?.country ? (
          <View pointerEvents="none" style={styles.countryBadge}>
            <CountryFlag country={participant.country} size={14} boxSize={19} />
          </View>
        ) : null}
      </View>

      <View style={styles.copy}>
        <ThemedText type="bold" numberOfLines={1} style={styles.name}>
          {before}
          {match ? <ThemedText style={[styles.name, styles.highlight]}>{match}</ThemedText> : null}
          {after}
        </ThemedText>
        <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.meta}>
          {meta}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={t('row.open', { name })}
          accessibilityRole="button"
          hitSlop={4}
          onPress={onOpenChat}
          style={({ pressed }) => [styles.actionButton, pressed && styles.rowPressed]}>
          <SymbolView
            name={{ ios: 'bubble.left.fill', android: 'chat', web: 'chat' }}
            size={18}
            weight="semibold"
            tintColor={styles.actionIcon.color}
          />
        </Pressable>
        <Pressable
          accessibilityLabel={
            isGroup ? t('header.viewGroup', { name }) : t('discover:viewProfile', { name })
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: !canOpenProfile }}
          disabled={!canOpenProfile}
          hitSlop={4}
          onPress={onOpenProfile}
          style={({ pressed }) => [
            styles.actionButton,
            !canOpenProfile && styles.actionButtonDisabled,
            pressed && styles.rowPressed,
          ]}>
          <SymbolView
            name={
              isGroup
                ? { ios: 'info.circle', android: 'info', web: 'info' }
                : { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }
            }
            size={19}
            weight="semibold"
            tintColor={styles.actionIcon.color}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}
