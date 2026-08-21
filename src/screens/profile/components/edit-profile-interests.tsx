import { Pressable, View } from 'react-native';

import { INTERESTS } from '@/screens/onboarding/data';
import { InterestIcon, getInterestLabel } from '@/shared/components/ui/interest-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useEditProfileStyles } from '../styles/edit-profile-styles';

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

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <ThemedText style={styles.label}>Interests</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.characterCount}>
          {value.length} selected · 3 minimum
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

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}
