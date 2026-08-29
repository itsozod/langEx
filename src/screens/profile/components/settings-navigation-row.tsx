import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import { SymbolView, type SymbolViewProps } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

type SettingsNavigationRowProps = {
  accessibilityHint: string;
  icon: SymbolViewProps['name'];
  onPress: () => void;
  subtitle: string;
  title: string;
};

export function SettingsNavigationRow({
  accessibilityHint,
  icon,
  onPress,
  subtitle,
  title,
}: SettingsNavigationRowProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} settings`}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isDark ? styles.rowDark : styles.rowLight,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.iconBox, isDark && styles.iconBoxDark]}>
        <SymbolView
          name={icon}
          size={24}
          weight="medium"
          tintColor={isDark ? '#C9BEFF' : '#6654C7'}
        />
      </View>
      <View style={styles.copy}>
        <ThemedText type="bold" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      </View>
      <View style={styles.chevronBox}>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={18}
          weight="semibold"
          tintColor={isDark ? '#817989' : '#9A92A2'}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0,
    borderRadius: 22,
    borderCurve: 'continuous',
  },
  rowLight: {
    backgroundColor: '#FFFFFF',
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 11,
        blurRadius: 26,
        spreadDistance: -8,
        color: 'rgba(54,40,113,0.12)',
      },
    ],
  },
  rowDark: {
    backgroundColor: '#1D1828',
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 12,
        blurRadius: 28,
        spreadDistance: -8,
        color: 'rgba(0,0,0,0.38)',
      },
    ],
  },
  iconBox: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: '#EEEAFB',
  },
  iconBoxDark: { backgroundColor: '#2A2338' },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 15, lineHeight: 21 },
  subtitle: { fontSize: 12, lineHeight: 18 },
  chevronBox: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
});
