import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileLanguage } from '@/screens/profile/components/profile-language';
import { SettingsHeader } from '@/screens/profile/components/settings-header';
import GradientBackground from '@/shared/components/ui/gradient-background';

import { useSettingsPageStyles } from './styles/settings-page-styles';

export default function LanguageSettingsScreen() {
  const styles = useSettingsPageStyles();
  const { t } = useTranslation('profile');

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <SettingsHeader fallbackHref="/profile/settings" title={t('language.title')} />
            <ProfileLanguage />
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}
