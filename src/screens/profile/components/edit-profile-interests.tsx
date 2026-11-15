import { Pressable, View } from 'react-native';

import { INTERESTS } from '@/screens/onboarding/data';
import { InterestIcon, getInterestLabel } from '@/shared/components/ui/interest-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useEditProfileStyles } from '../styles/edit-profile-styles';
import { useTranslation } from 'react-i18next';
import { translateMessage } from '@/shared/i18n/translate-message';

type EditProfileInterestsProps = {
  disabled: boolean;
  error?: string;
  onChange: (interests: string[]) => void;
  onClearErrors: () => void;
  value: string[];
};

export function EditProfileInterests({
  disabled,
  error,
  onChange,
  onClearErrors,
  value,
}: EditProfileInterestsProps) {
  const styles = useEditProfileStyles();
  const { t } = useTranslation('profile');

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <ThemedText style={styles.label}>{t('sections.interests')}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.characterCount}>
          {t('edit.interestsCounter', { count: value.length, minimum: 3 })}
        </ThemedText>
      </View>

      <View style={styles.interestGrid}>
        {INTERESTS.map((interest) => {
          const selected = value.includes(interest);
          const contentColor = selected
            ? styles.interestTextSelected.color
            : styles.interestText.color;

          return (
            <Pressable
              key={interest}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              disabled={disabled}
              onPress={() => {
                onChange(
                  selected ? value.filter((item) => item !== interest) : [...value, interest],
                );
                onClearErrors();
              }}
              style={({ pressed }) => [
                styles.interestPill,
                selected && styles.interestPillSelected,
                pressed && styles.pressed,
              ]}>
              <InterestIcon interest={interest} size={15} color={contentColor} />
              <ThemedText style={[styles.interestText, selected && styles.interestTextSelected]}>
                {getInterestLabel(interest)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {error ? <ThemedText style={styles.error}>{translateMessage(t, error)}</ThemedText> : null}
    </View>
  );
}
