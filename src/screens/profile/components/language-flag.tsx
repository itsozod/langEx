import { View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { SymbolView } from '@/shared/components/ui/symbol-view';

import { useProfileStyles } from '../styles/profile-styles';
import { getLanguageCountryCode } from '../utils/language-country-codes';

export function LanguageFlag({ language }: { language?: string | null }) {
  const styles = useProfileStyles();
  const countryCode = getLanguageCountryCode(language);

  return (
    <View style={styles.flagCircle}>
      {countryCode ? (
        <CountryFlag country={countryCode} size={32} boxSize={32} />
      ) : (
        <SymbolView
          name={{ ios: 'globe', android: 'public', web: 'public' }}
          size={22}
          tintColor={styles.languageFlagFallback.color}
        />
      )}
    </View>
  );
}
