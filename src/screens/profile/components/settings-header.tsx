import { type Href, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

type SettingsHeaderProps = {
  fallbackHref: Href;
  title: string;
};

/** Compact navigation bar for settings pages: back button and a centered title. */
export function SettingsHeader({ fallbackHref, title }: SettingsHeaderProps) {
  const tokens = useUiTokens();
  const { t } = useTranslation();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('actions.goBack')}
        hitSlop={10}
        onPress={goBack}
        style={({ pressed }) => [
          styles.backButton,
          { backgroundColor: tokens.fill },
          pressed && styles.pressed,
        ]}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
          size={18}
          weight="semibold"
          tintColor={tokens.text}
        />
      </Pressable>
      <ThemedText
        accessibilityRole="header"
        numberOfLines={1}
        style={[styles.title, { color: tokens.text }]}>
        {title}
      </ThemedText>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: { flex: 1, textAlign: 'center', fontFamily: FONT.semibold, fontSize: 17, lineHeight: 22 },
  spacer: { width: 40 },
  pressed: { opacity: 0.6 },
});
