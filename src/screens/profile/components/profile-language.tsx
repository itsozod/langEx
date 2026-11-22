import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { ICON_ROW_INSET, ListRow, ListSection } from '@/shared/components/ui/grouped-list';
import { SymbolView } from '@/shared/components/ui/symbol-view';
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

/** App language as a single-choice list; names are shown in their own language. */
export function ProfileLanguage() {
  const styles = useProfileStyles();
  const { t } = useTranslation('profile');
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <ListSection footer={t('language.description')} inset={ICON_ROW_INSET}>
      {SUPPORTED_LANGUAGES.map((option) => {
        const selected = language === option;
        return (
          <ListRow
            key={option}
            accessibilityLabel={LANGUAGE_NATIVE_NAMES[option]}
            leading={
              <View style={localStyles.flag}>
                <CountryFlag country={LANGUAGE_FLAGS[option]} size={30} boxSize={30} />
              </View>
            }
            onPress={() => setLanguage(option)}
            showChevron={false}
            title={LANGUAGE_NATIVE_NAMES[option]}
            trailing={
              selected ? (
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  size={17}
                  weight="semibold"
                  tintColor={styles.check.color}
                />
              ) : undefined
            }
          />
        );
      })}
    </ListSection>
  );
}

const localStyles = StyleSheet.create({
  flag: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden' },
});
