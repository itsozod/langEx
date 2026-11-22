import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getLanguageLabel } from '@/screens/onboarding/data';
import { ContactAvatar } from '@/shared/components/ui/contact-avatar';
import { getInterestLabel, InterestIcon } from '@/shared/components/ui/interest-icon';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { getLevelLabel } from '@/shared/constants/language-levels';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

import type { DiscoverUser } from './types';

const GUTTER = 20;
const AVATAR_SIZE = 56;
const AVATAR_GAP = 14;
const MAX_VISIBLE_INTERESTS = 3;

/** A potential language partner: who they are, their language pair, and what you share. */
export function UserCard({ user }: { user: DiscoverUser }) {
  const styles = useStyles();
  const { t } = useTranslation('discover');
  const name = user.displayName || t('fallbackName');
  const visibleInterests = user.sharedInterests.slice(0, MAX_VISIBLE_INTERESTS);
  const remainingInterests = user.sharedInterests.length - visibleInterests.length;
  const languagePair = [
    getLanguageLabel(user.nativeLanguage) || '—',
    getLanguageLabel(user.learningLanguage) || '—',
  ].join(' → ');
  const level = user.proficiencyLevel ? getLevelLabel(user.proficiencyLevel) : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('viewProfile', { name })}
      onPress={() => router.push({ pathname: '/profile/[id]', params: { id: user.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <ContactAvatar avatarUrl={user.avatarUrl} name={name} size={AVATAR_SIZE} />

      <View style={styles.details}>
        <View style={styles.nameRow}>
          <ThemedText numberOfLines={1} style={styles.name}>
            {name}
          </ThemedText>
          {user.country ? <CountryFlag country={user.country} size={14} boxSize={16} /> : null}
        </View>

        <ThemedText numberOfLines={1} style={styles.languages}>
          {languagePair}
          {level ? <ThemedText style={styles.level}>{`  ·  ${level}`}</ThemedText> : null}
        </ThemedText>

        {user.bio ? (
          <ThemedText numberOfLines={2} style={styles.bio}>
            {user.bio}
          </ThemedText>
        ) : null}

        {visibleInterests.length ? (
          <View style={styles.interests}>
            {visibleInterests.map((interest) => (
              <View key={interest} style={styles.interestTag}>
                <InterestIcon color={styles.interestText.color} interest={interest} size={12} />
                <ThemedText numberOfLines={1} style={styles.interestText}>
                  {getInterestLabel(interest)}
                </ThemedText>
              </View>
            ))}
            {remainingInterests > 0 ? (
              <View style={styles.interestTag}>
                <ThemedText style={styles.interestText}>+{remainingInterests}</ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function UserCardSkeleton() {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Skeleton style={styles.skeletonAvatar} />
      <View style={styles.details}>
        <Skeleton style={styles.skeletonName} />
        <Skeleton style={styles.skeletonLine} />
        <Skeleton style={styles.skeletonLineShort} />
      </View>
    </View>
  );
}

const useStyles = () => {
  const tokens = useUiTokens();

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: AVATAR_GAP,
      paddingHorizontal: GUTTER,
      paddingVertical: 14,
    },
    rowPressed: { backgroundColor: tokens.fillPressed },
    details: { flex: 1, minWidth: 0, gap: 4 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: {
      flexShrink: 1,
      color: tokens.text,
      fontFamily: FONT.semibold,
      fontSize: 16,
      lineHeight: 21,
    },
    languages: { color: tokens.text, fontFamily: FONT.medium, fontSize: 14, lineHeight: 19 },
    level: { color: tokens.muted, fontFamily: FONT.regular },
    bio: { color: tokens.muted, fontSize: 14, lineHeight: 19 },
    interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
    interestTag: {
      height: 26,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: 13,
      paddingHorizontal: 10,
      backgroundColor: tokens.fill,
    },
    interestText: { color: tokens.muted, fontFamily: FONT.medium, fontSize: 12, lineHeight: 16 },
    skeletonAvatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
    skeletonName: { width: '40%', height: 13, borderRadius: 7, marginTop: 4 },
    skeletonLine: { width: '70%', height: 11, borderRadius: 6, marginTop: 6 },
    skeletonLineShort: { width: '52%', height: 11, borderRadius: 6, marginTop: 6 },
  });
};

/** Where separators start: aligned with the text column. */
export const USER_CARD_TEXT_INSET = GUTTER + AVATAR_SIZE + AVATAR_GAP;
