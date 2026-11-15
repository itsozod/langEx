import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getInitials, getLanguageFlag } from '@/screens/profile/utils/language-flags';
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
      <View style={styles.avatarWrap}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} contentFit="cover" style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ThemedText style={styles.initials}>{getInitials(name, '')}</ThemedText>
          </View>
        )}
        {user.country ? (
          <View style={styles.flagBadge}>
            <CountryFlag country={user.country} size={14} boxSize={19} />
          </View>
        ) : null}
      </View>

      <View style={styles.resultCopy}>
        <ThemedText type="bold" numberOfLines={1} style={styles.resultName}>
          {name}
        </ThemedText>
        <View style={styles.languageLine}>
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.languageText}>
            {getLanguageFlag(user.nativeLanguage)}{' '}
            {getLanguageLabel(user.nativeLanguage) || t('profile:sections.notAdded')}
          </ThemedText>
          <ThemedText style={styles.arrow}>→</ThemedText>
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.languageText}>
            {getLanguageFlag(user.learningLanguage)}{' '}
            {getLanguageLabel(user.learningLanguage) || t('profile:sections.notAdded')}
          </ThemedText>
        </View>
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
