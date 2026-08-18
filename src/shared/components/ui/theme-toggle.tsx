import { useAppTheme, type ThemePreference } from '@/providers/theme-provider';
import { SymbolView, type SymbolViewProps } from '@/shared/components/ui/symbol-view';
import { Pressable, StyleSheet } from 'react-native';

const ICONS: Record<ThemePreference, SymbolViewProps['name']> = {
  system: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  light: { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' },
  dark: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
};

const LABELS: Record<ThemePreference, string> = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};

export function ThemeToggle() {
  const { preference, theme, cyclePreference } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${LABELS[preference]}. Tap to change theme.`}
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
