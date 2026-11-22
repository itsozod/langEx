import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { ContactAvatar } from '@/shared/components/ui/contact-avatar';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import type { ChatParticipant } from '@/screens/chat/types/message.types';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useGroupStyles } from '../styles/group-styles';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['groups', 'common', 'discover']);
  const name = candidate.isDeleted
    ? t('common:deletedUser')
    : candidate.displayName?.trim() || t('discover:fallbackName');

  return (
    <Pressable
      accessibilityRole={selectionMode ? 'checkbox' : 'button'}
      accessibilityLabel={
        selectionMode
          ? selected
            ? t('person.deselect', { name })
            : t('person.select', { name })
          : t('person.view', { name })
      }
      accessibilityState={selectionMode ? { checked: selected, disabled } : { disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.personRow,
        selected && styles.personRowSelected,
        disabled && styles.personRowDisabled,
        pressed && styles.pressed,
      ]}>
      <ContactAvatar
        avatarUrl={candidate.avatarUrl}
        isOnline={selectionMode && Boolean(candidate.isOnline)}
        name={name}
        size={48}
        variant={candidate.isDeleted ? 'deleted' : 'person'}
      />
      <View style={styles.personCopy}>
        <View style={styles.personNameRow}>
          <ThemedText numberOfLines={1} style={styles.personName}>
            {name}
          </ThemedText>
          {candidate.country ? (
            <CountryFlag country={candidate.country} size={14} boxSize={16} />
          ) : null}
        </View>
        <ThemedText numberOfLines={1} style={styles.personMeta}>
          {selectionMode
            ? candidate.isOnline
              ? t('common:status.online')
              : t('person.fromChats')
            : (roleLabel ?? t('roles.member'))}
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
          accessibilityLabel={t('person.manage', { name })}
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
