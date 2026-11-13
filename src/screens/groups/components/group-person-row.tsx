import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import type { ChatParticipant } from '@/screens/chat/types/message.types';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useGroupStyles } from '../styles/group-styles';
type GroupPersonRowProps = {
  candidate: ChatParticipant;
  disabled?: boolean;
  onManage?: () => void;
  onPress: () => void;
  roleLabel?: string;
  selected?: boolean;
  selectionMode?: boolean;
};

export const GroupPersonRow = memo(function GroupPersonRow({
  candidate,
  disabled,
  onManage,
  onPress,
  roleLabel,
  selected,
  selectionMode,
}: GroupPersonRowProps) {
  const styles = useGroupStyles();
  const name = candidate.isDeleted
    ? 'Deleted user'
    : candidate.displayName?.trim() || 'Language partner';

  return (
    <Pressable
      accessibilityRole={selectionMode ? 'checkbox' : 'button'}
      accessibilityLabel={selectionMode ? `${selected ? 'Remove' : 'Add'} ${name}` : `View ${name}`}
      accessibilityState={selectionMode ? { checked: selected, disabled } : { disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.personRow,
        selected && styles.personRowSelected,
        disabled && styles.personRowDisabled,
        pressed && styles.pressed,
      ]}>
      <View style={styles.personAvatarWrap}>
        {candidate.avatarUrl ? (
          <Image
            source={{ uri: candidate.avatarUrl }}
            contentFit="cover"
            style={styles.personAvatar}
          />
        ) : (
          <View style={styles.personAvatarPlaceholder}>
            <ThemedText type="bold" style={styles.personInitials}>
              {getInitials(name)}
            </ThemedText>
          </View>
        )}
        {candidate.country ? (
          <View pointerEvents="none" style={styles.countryBadge}>
            <CountryFlag country={candidate.country} size={13} boxSize={18} />
          </View>
        ) : null}
      </View>
      <View style={styles.personCopy}>
        <ThemedText type="bold" numberOfLines={1} style={styles.personName}>
          {name}
        </ThemedText>
        <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.personMeta}>
          {selectionMode
            ? candidate.isOnline
              ? 'Online'
              : 'From your chats'
            : (roleLabel ?? 'Member')}
        </ThemedText>
      </View>
      {selectionMode ? (
        <View style={[styles.selectionControl, selected && styles.selectionControlSelected]}>
          {selected ? (
            <SymbolView
              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
              size={16}
              weight="bold"
              tintColor="#FFFFFF"
            />
          ) : null}
        </View>
      ) : onManage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Manage ${name}`}
          hitSlop={4}
          onPress={(event) => {
            event.stopPropagation();
            onManage();
          }}
          style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' }}
            size={21}
            weight="semibold"
            tintColor={styles.disclosureIcon.color}
          />
        </Pressable>
      ) : (
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={18}
          tintColor={styles.disclosureIcon.color}
        />
      )}
    </Pressable>
  );
});

function getInitials(name: string) {
  return name
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
