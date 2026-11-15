import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { ThemedText } from '@/shared/components/ui/themed-text';
import {
  type AppLanguage,
  LANGUAGE_NATIVE_NAMES,
  SUPPORTED_LANGUAGES,
} from '@/shared/i18n/languages';
import { useLanguageStore } from '@/shared/store/language-store';

import { useProfileStyles } from '../styles/profile-styles';

const LANGUAGE_FLAGS: Record<AppLanguage, string> = {
  en: 'GB',
  ru: 'RU',
};

export function ProfileLanguage() {
  const styles = useProfileStyles();
  const { t } = useTranslation('profile');
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
      <View>
        <ThemedText type="bold" style={styles.sectionTitle}>
          {t('language.title')}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.appearanceSubtitle}>
          {t('language.description')}
        </ThemedText>
      </View>
      <View accessibilityRole="radiogroup" style={styles.themeOptions}>
        {SUPPORTED_LANGUAGES.map((option) => {
          const selected = language === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityLabel={LANGUAGE_NATIVE_NAMES[option]}
              accessibilityState={{ selected }}
              onPress={() => setLanguage(option)}
              style={({ pressed }) => [
                styles.themeOption,
                selected && styles.themeOptionSelected,
                pressed && styles.pressed,
              ]}>
              <CountryFlag country={LANGUAGE_FLAGS[option]} size={20} boxSize={26} />
              <ThemedText
                style={[styles.themeOptionText, selected && styles.themeOptionTextSelected]}>
                {LANGUAGE_NATIVE_NAMES[option]}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
