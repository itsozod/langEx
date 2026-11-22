import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppVersion } from '@/screens/profile/components/app-version';
import { SettingsHeader } from '@/screens/profile/components/settings-header';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { ICON_ROW_INSET, ListRow, ListSection } from '@/shared/components/ui/grouped-list';
import { LANGUAGE_NATIVE_NAMES } from '@/shared/i18n/languages';
import { useLanguageStore } from '@/shared/store/language-store';

import { useSettingsPageStyles } from './styles/settings-page-styles';

export default function ProfileSettingsScreen() {
  const styles = useSettingsPageStyles();
  const { t } = useTranslation('profile');
  const language = useLanguageStore((state) => state.language);

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <SettingsHeader fallbackHref="/(tabs)/profile" title={t('settings.title')} />

            <ListSection inset={ICON_ROW_INSET}>
              <ListRow
                accessibilityHint={t('settings.accountHint')}
                icon={{
                  ios: 'person.crop.circle',
                  android: 'account_circle',
                  web: 'account_circle',
                }}
                onPress={() => router.push('/profile/account')}
                title={t('account.title')}
              />
            </ListSection>

            <ListSection inset={ICON_ROW_INSET}>
              <ListRow
                accessibilityHint={t('settings.themeHint')}
                icon={{ ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' }}
                onPress={() => router.push('/profile/theme')}
                title={t('theme.title')}
              />
              <ListRow
                accessibilityHint={t('settings.languageHint')}
                icon={{ ios: 'globe', android: 'public', web: 'public' }}
                onPress={() => router.push('/profile/language')}
                title={t('language.title')}
                value={LANGUAGE_NATIVE_NAMES[language]}
              />
            </ListSection>

            <AppVersion />
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}
