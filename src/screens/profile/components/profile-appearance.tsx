import { Pressable, View } from 'react-native';

import { useAppTheme, type ThemePreference } from '@/providers/theme-provider';
import { SymbolView, type SymbolViewProps } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useProfileStyles } from '../styles/profile-styles';
import { useTranslation } from 'react-i18next';

const OPTIONS: {
  value: ThemePreference;
  labelKey: 'theme.system' | 'theme.light' | 'theme.dark';
  icon: SymbolViewProps['name'];
}[] = [
  {
    value: 'system',
    labelKey: 'theme.system',
    icon: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  },
  {
    value: 'light',
    labelKey: 'theme.light',
    icon: { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' },
  },
  {
    value: 'dark',
    labelKey: 'theme.dark',
    icon: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
  },
];

export function ProfileAppearance() {
  const styles = useProfileStyles();
  const { preference, setPreference } = useAppTheme();
  const { t } = useTranslation('profile');
  return (
    <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
      <View>
        <ThemedText type="bold" style={styles.sectionTitle}>
          {t('theme.title')}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.appearanceSubtitle}>
          {t('theme.description')}
        </ThemedText>
      </View>
      <View accessibilityRole="radiogroup" style={styles.themeOptions}>
        {OPTIONS.map((option) => {
          const selected = preference === option.value;
          const label = t(option.labelKey);
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={t('theme.optionLabel', { option: label })}
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
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
