import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getCountryName } from '@/screens/onboarding/data';
import { getLanguageFlag } from '@/screens/profile/language-flags';
import { getInterestLabel, InterestIcon } from '@/shared/components/ui/interest-icon';

import type { DiscoverUser } from './types';

const initialsFor = (name?: string | null) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return parts.length
    ? parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : '?';
};

const titleCase = (value: string) => value[0].toUpperCase() + value.slice(1);

export function UserCard({ user }: { user: DiscoverUser }) {
  const styles = useStyles();
  const visibleInterests = user.sharedInterests.slice(0, 3);
  const remainingInterests = user.sharedInterests.length - visibleInterests.length;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${user.displayName ?? 'language partner'}'s profile`}
      onPress={() => router.push({ pathname: '/profile/[id]', params: { id: user.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.avatarColumn}>
        <View style={styles.avatarWrap}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} contentFit="cover" style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <ThemedText style={styles.initials}>{initialsFor(user.displayName)}</ThemedText>
            </View>
          )}
          {user.country ? (
            <View style={styles.countryBadge}>
              <CountryFlag country={user.country} size={15} boxSize={21} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.nameRow}>
          <ThemedText type="bold" numberOfLines={1} style={styles.name}>
            {user.displayName || 'Language partner'}
          </ThemedText>
          {user.country ? (
            <ThemedText numberOfLines={1} style={styles.country}>
              · {getCountryName(user.country)}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.languageRow}>
          <ThemedText style={styles.languageText}>
            {getLanguageFlag(user.nativeLanguage)} {user.nativeLanguage || '—'}
          </ThemedText>
          <ThemedText style={styles.arrow}>⇄</ThemedText>
          <ThemedText style={styles.languageText}>
            {getLanguageFlag(user.learningLanguage)} {user.learningLanguage || '—'}
          </ThemedText>
          {user.proficiencyLevel ? (
            <View style={styles.levelPill}>
              <ThemedText style={styles.levelText}>{titleCase(user.proficiencyLevel)}</ThemedText>
            </View>
          ) : null}
        </View>

        {user.bio ? (
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.bio}>
            {user.bio}
          </ThemedText>
        ) : null}

        {visibleInterests.length ? (
          <View style={styles.interests}>
            {visibleInterests.map((interest) => (
              <View key={interest} style={styles.interestPill}>
                <InterestIcon color={styles.interestText.color} interest={interest} size={11} />
                <ThemedText numberOfLines={1} style={styles.interestText}>
                  {getInterestLabel(interest)}
                </ThemedText>
              </View>
            ))}
            {remainingInterests > 0 ? (
              <View style={styles.morePill}>
                <ThemedText style={styles.moreText}>+{remainingInterests}</ThemedText>
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
      <View style={styles.avatarColumn}>
        <View style={[styles.avatar, styles.skeleton]} />
      </View>
      <View style={styles.skeletonDetails}>
        <View style={[styles.skeleton, styles.skeletonName]} />
        <View style={[styles.skeleton, styles.skeletonLanguages]} />
        <View style={[styles.skeleton, styles.skeletonBio]} />
        <View style={styles.skeletonPills}>
          <View style={[styles.skeleton, styles.skeletonPill]} />
          <View style={[styles.skeleton, styles.skeletonPill]} />
          <View style={[styles.skeleton, styles.skeletonPillShort]} />
        </View>
      </View>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    row: {
      minHeight: 134,
      flexDirection: 'row',
      gap: 14,
      paddingVertical: 17,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(64,52,88,0.14)',
    },
    pressed: { opacity: 0.65 },
    avatarColumn: { width: 72, alignItems: 'center' },
    avatarWrap: { width: 70, height: 70 },
    avatar: { width: 70, height: 70, borderRadius: 35 },
    avatarPlaceholder: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#55488A' : '#E8E2FF',
    },
    countryBadge: {
      position: 'absolute',
      right: -4,
      bottom: -3,
      width: 27,
      height: 27,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 2,
      borderColor: isDark ? '#1D1828' : '#FFFFFF',
      backgroundColor: isDark ? '#302A3E' : '#FFFFFF',
    },
    initials: {
      color: isDark ? '#F0ECFF' : '#5948A9',
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700',
    },
    details: { flex: 1, minWidth: 0, gap: 7 },
    nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
    name: { maxWidth: '62%', fontSize: 17, lineHeight: 22 },
    country: {
      flex: 1,
      color: isDark ? '#928B9D' : '#85808C',
      fontSize: 11,
      lineHeight: 16,
    },
    languageRow: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 20 },
    languageText: {
      color: isDark ? '#D8D3E1' : '#504A59',
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '600',
    },
    arrow: { color: isDark ? '#777080' : '#A19AA9', fontSize: 12, lineHeight: 16 },
    levelPill: {
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
      backgroundColor: isDark ? 'rgba(138,116,255,0.18)' : '#EEE9FF',
    },
    levelText: {
      color: isDark ? '#C9BEFF' : '#604DB7',
      fontSize: 8,
      lineHeight: 12,
      fontWeight: '700',
    },
    bio: { fontSize: 12, lineHeight: 17 },
    interests: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    interestPill: {
      flexShrink: 1,
      maxWidth: '31%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: isDark ? 'rgba(255,193,92,0.13)' : '#FFF2D5',
    },
    interestText: {
      color: isDark ? '#FFD58F' : '#805B12',
      fontSize: 9,
      lineHeight: 13,
    },
    morePill: {
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 4,
      backgroundColor: isDark ? '#35303F' : '#EFECF2',
    },
    moreText: { color: isDark ? '#B8B1C8' : '#6D6677', fontSize: 9, lineHeight: 13 },
    skeleton: { backgroundColor: isDark ? '#3A3446' : '#E8E4ED' },
    skeletonDetails: { flex: 1, gap: 10, paddingTop: 2 },
    skeletonName: { width: '44%', height: 15, borderRadius: 8 },
    skeletonLanguages: { width: '68%', height: 11, borderRadius: 6 },
    skeletonBio: { width: '92%', height: 11, borderRadius: 6 },
    skeletonPills: { flexDirection: 'row', gap: 6 },
    skeletonPill: { width: 62, height: 21, borderRadius: 11 },
    skeletonPillShort: { width: 42, height: 21, borderRadius: 11 },
  });
};
