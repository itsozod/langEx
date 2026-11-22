import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ContactAvatar } from '@/shared/components/ui/contact-avatar';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatSearchStyles } from '../styles/chat-search-styles';
import type { ChatParticipant, Conversation } from '../types/message.types';
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
      <ContactAvatar
        avatarUrl={participant?.avatarUrl}
        isOnline={isOnline}
        name={name}
        variant={isGroup ? 'group' : isDeleted ? 'deleted' : 'person'}
      />

      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <ThemedText numberOfLines={1} style={styles.name}>
            {before}
            {match ? (
              <ThemedText style={[styles.name, styles.highlight]}>{match}</ThemedText>
            ) : null}
            {after}
          </ThemedText>
          {!isGroup && participant?.country ? (
            <CountryFlag country={participant.country} size={14} boxSize={16} />
          ) : null}
        </View>
        <ThemedText numberOfLines={1} style={styles.meta}>
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
            name={{ ios: 'bubble.left', android: 'chat', web: 'chat' }}
            size={20}
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
            size={21}
            tintColor={styles.actionIcon.color}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}
