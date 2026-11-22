import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { ContactAvatar } from '@/shared/components/ui/contact-avatar';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useUserSearchStyles } from '../styles/user-search-styles';
import type { UserSearchResult } from '../types';
import { useTranslation } from 'react-i18next';
import { getLanguageLabel } from '@/screens/onboarding/data';
import { leaveSearch } from '@/shared/components/search-overlay/search-overlay';

type UserSearchResultRowProps = {
  user: UserSearchResult;
};

export function UserSearchResultRow({ user }: UserSearchResultRowProps) {
  const styles = useUserSearchStyles();
  const { t } = useTranslation(['discover', 'profile']);
  const name = user.displayName || t('fallbackName');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('viewProfile', { name })}
      onPress={() =>
        leaveSearch(() => router.push({ pathname: '/profile/[id]', params: { id: user.id } }))
      }
      style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}>
      <ContactAvatar avatarUrl={user.avatarUrl} name={name} />

      <View style={styles.resultCopy}>
        <View style={styles.nameRow}>
          <ThemedText numberOfLines={1} style={styles.resultName}>
            {name}
          </ThemedText>
          {user.country ? <CountryFlag country={user.country} size={14} boxSize={16} /> : null}
        </View>
        <ThemedText numberOfLines={1} style={styles.languageText}>
          {[
            getLanguageLabel(user.nativeLanguage) || t('profile:sections.notAdded'),
            getLanguageLabel(user.learningLanguage) || t('profile:sections.notAdded'),
          ].join(' → ')}
        </ThemedText>
      </View>

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={18}
        weight="semibold"
        tintColor={styles.chevron.color}
      />
    </Pressable>
  );
}
