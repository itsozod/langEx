import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

type SettingsHeaderProps = {
  fallbackHref: Href;
  subtitle: string;
  title: string;
};

export function SettingsHeader({ fallbackHref, subtitle, title }: SettingsHeaderProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={10}
        onPress={goBack}
        style={({ pressed }) => [
          styles.backButton,
          isDark ? styles.backButtonDark : styles.backButtonLight,
          pressed && styles.pressed,
        ]}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
          size={21}
          weight="semibold"
          tintColor={isDark ? '#F0EAF9' : '#302A3A'}
        />
      </Pressable>
      <View style={styles.headerCopy}>
        <ThemedText type="bold" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center' },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    borderWidth: 1,
  },
  backButtonLight: {
    borderColor: 'rgba(91,70,176,0.10)',
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  backButtonDark: {
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  headerCopy: { flex: 1, alignItems: 'center', gap: 1 },
  title: { fontSize: 17, lineHeight: 23 },
  subtitle: { fontSize: 11, lineHeight: 16 },
  headerSpacer: { width: 42 },
  pressed: { opacity: 0.65 },
});
