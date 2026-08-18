import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';
import type { ChatParticipant } from '../types';
import { getInitials } from '../utils/messages';

type ChatHeaderProps = {
  participant?: ChatParticipant;
  onBack: () => void;
  onOpenProfile: () => void;
};

export function ChatHeader({ participant, onBack, onOpenProfile }: ChatHeaderProps) {
  const styles = useChatStyles();
  const name = participant?.displayName?.trim() || 'Language partner';

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
          <ThemedText style={styles.onlineText}>Conversation</ThemedText>
        </View>
      </Pressable>
    </View>
  );
}
