import { Pressable, View } from 'react-native';

import { useAppTheme, type ThemePreference } from '@/providers/theme-provider';
import { SymbolView, type SymbolViewProps } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useProfileStyles } from '../styles/profile-styles';

const OPTIONS: { value: ThemePreference; label: string; icon: SymbolViewProps['name'] }[] = [
  {
    value: 'system',
    label: 'System',
    icon: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  },
  {
    value: 'light',
    label: 'Light',
    icon: { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' },
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
  },
];

export function ProfileAppearance() {
  const styles = useProfileStyles();
  const { preference, setPreference } = useAppTheme();
  return (
    <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
      <View>
        <ThemedText type="bold" style={styles.sectionTitle}>
          Appearance
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.appearanceSubtitle}>
          Choose how LangEx looks on this device.
        </ThemedText>
      </View>
      <View accessibilityRole="radiogroup" style={styles.themeOptions}>
        {OPTIONS.map((option) => {
          const selected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} theme`}
              accessibilityState={{ selected }}
              onPress={() => setPreference(option.value)}
              style={({ pressed }) => [
                styles.themeOption,
                selected && styles.themeOptionSelected,
                pressed && styles.pressed,
              ]}>
              <SymbolView
                name={option.icon}
                size={19}
                tintColor={selected ? '#FFFFFF' : styles.themeOptionText.color}
              />
              <ThemedText
                style={[styles.themeOptionText, selected && styles.themeOptionTextSelected]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
