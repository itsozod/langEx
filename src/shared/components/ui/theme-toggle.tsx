import { useAppTheme, type ThemePreference } from '@/providers/theme-provider';
import { SymbolView, type SymbolViewProps } from '@/shared/components/ui/symbol-view';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const ICONS: Record<ThemePreference, SymbolViewProps['name']> = {
  system: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  light: { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' },
  dark: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
};

const LABEL_KEYS = {
  system: 'themeToggle.system',
  light: 'themeToggle.light',
  dark: 'themeToggle.dark',
} as const satisfies Record<ThemePreference, string>;

export function ThemeToggle() {
  const { preference, theme, cyclePreference } = useAppTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('themeToggle.label', { theme: t(LABEL_KEYS[preference]) })}
      hitSlop={8}
      onPress={cyclePreference}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.76)',
          borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(91,70,176,0.10)',
        },
        pressed && styles.pressed,
      ]}>
      <SymbolView name={ICONS[preference]} size={20} tintColor={isDark ? '#E8E1F5' : '#4D4261'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.62,
    transform: [{ scale: 0.97 }],
  },
});

export default ThemeToggle;
