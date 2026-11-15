import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppVersion } from '@/screens/profile/components/app-version';
import { SettingsHeader } from '@/screens/profile/components/settings-header';
import { SettingsNavigationRow } from '@/screens/profile/components/settings-navigation-row';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_NATIVE_NAMES } from '@/shared/i18n/languages';
import { useLanguageStore } from '@/shared/store/language-store';

export default function ProfileSettingsScreen() {
  const { t } = useTranslation('profile');
  const language = useLanguageStore((state) => state.language);
  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <SettingsHeader
              fallbackHref="/(tabs)/profile"
              subtitle={t('settings.subtitle')}
              title={t('settings.title')}
            />

            <SettingsNavigationRow
              accessibilityHint={t('settings.accountHint')}
              icon={{
                ios: 'person.crop.circle',
                android: 'account_circle',
                web: 'account_circle',
              }}
              onPress={() => router.push('/profile/account')}
              subtitle={t('settings.accountSubtitle')}
              title={t('account.title')}
            />

            <SettingsNavigationRow
              accessibilityHint={t('settings.themeHint')}
              icon={{ ios: 'paintpalette', android: 'palette', web: 'palette' }}
              onPress={() => router.push('/profile/theme')}
              subtitle={t('settings.themeSubtitle')}
              title={t('theme.title')}
            />

            <SettingsNavigationRow
              accessibilityHint={t('settings.languageHint')}
              icon={{ ios: 'globe', android: 'public', web: 'public' }}
              onPress={() => router.push('/profile/language')}
              subtitle={LANGUAGE_NATIVE_NAMES[language]}
              title={t('language.title')}
            />

            <AppVersion />
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
  },
  content: { width: '100%', maxWidth: 520, gap: 20 },
});
