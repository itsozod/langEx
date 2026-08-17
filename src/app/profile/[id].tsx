import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { usePublicUser } from '@/screens/discover/hooks';
import { useFindDirectConversation } from '@/screens/chat/hooks';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getCountryName } from '@/screens/onboarding/data';
import { getInitials, getLanguageFlag } from '@/screens/profile/language-flags';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { useAuthStore } from '@/shared/store/auth-store';

const titleCase = (value: string) => value[0].toUpperCase() + value.slice(1);

export default function PublicProfile() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const styles = useStyles();
  const currentUser = useAuthStore((state) => state.user);
  const query = usePublicUser(id);
  const findConversation = useFindDirectConversation();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/discover');
  };

  if (query.isPending) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#6654C7" />
          <ThemedText themeColor="textSecondary" style={styles.loadingText}>
            Loading profile…
          </ThemedText>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (query.isError || !query.data?.user) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <ThemedText type="bold" style={styles.errorTitle}>
            Couldn&apos;t load this profile
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.errorMessage}>
            {query.error instanceof Error ? query.error.message : 'This user may no longer exist.'}
          </ThemedText>
          <Pressable onPress={goBack} style={styles.errorButton}>
            <ThemedText style={styles.errorButtonText}>Back to discover</ThemedText>
          </Pressable>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const user = query.data.user;
  const shared = new Set(currentUser?.interests ?? []);

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to discover"
                hitSlop={10}
                onPress={goBack}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                  size={22}
                  weight="semibold"
                  tintColor={styles.icon.color}
                />
              </Pressable>
              <ThemedText type="bold" style={styles.headerTitle}>
                Partner profile
              </ThemedText>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.heroCard}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} contentFit="cover" style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <ThemedText style={styles.initials}>
                    {getInitials(user.displayName, user.email)}
                  </ThemedText>
                </View>
              )}
              <ThemedText type="title" style={styles.displayName}>
                {user.displayName || user.email.split('@')[0]}
              </ThemedText>
              {user.country ? (
                <View style={styles.countryRow}>
                  <CountryFlag country={user.country} size={17} boxSize={23} />
                  <ThemedText style={styles.muted}>{getCountryName(user.country)}</ThemedText>
                </View>
              ) : null}
            </View>

            <View style={styles.sectionCard}>
              <ThemedText type="bold" style={styles.sectionTitle}>
                Languages
              </ThemedText>
              <View style={styles.languageRow}>
                <View style={styles.flagCircle}>
                  <ThemedText style={styles.flag}>
                    {getLanguageFlag(user.nativeLanguage)}
                  </ThemedText>
                </View>
                <View style={styles.languageCopy}>
                  <ThemedText style={styles.eyebrow}>Native language</ThemedText>
                  <ThemedText type="bold" style={styles.languageName}>
                    {user.nativeLanguage || 'Not added'}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.languageRow}>
                <View style={styles.flagCircle}>
                  <ThemedText style={styles.flag}>
                    {getLanguageFlag(user.learningLanguage)}
                  </ThemedText>
                </View>
                <View style={styles.languageCopy}>
                  <ThemedText style={styles.eyebrow}>Learning</ThemedText>
                  <ThemedText type="bold" style={styles.languageName}>
                    {user.learningLanguage || 'Not added'}
                  </ThemedText>
                </View>
                {user.proficiencyLevel ? (
                  <View style={styles.levelPill}>
                    <ThemedText style={styles.levelText}>
                      {titleCase(user.proficiencyLevel)}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>

            {user.interests.length ? (
              <View style={styles.sectionCard}>
                <ThemedText type="bold" style={styles.sectionTitle}>
                  Interests
                </ThemedText>
                <View style={styles.interests}>
                  {user.interests.map((interest) => {
                    const isShared = shared.has(interest);
                    return (
                      <View
                        key={interest}
                        style={[styles.interestPill, isShared && styles.sharedInterestPill]}>
                        <ThemedText
                          style={[styles.interestText, isShared && styles.sharedInterestText]}>
                          {interest}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.legendRow}>
                  <View style={styles.legendDot} />
                  <ThemedText style={styles.legendText}>Shared with you</ThemedText>
                </View>
              </View>
            ) : null}

            {user.bio ? (
              <View style={styles.sectionCard}>
                <ThemedText type="bold" style={styles.sectionTitle}>
                  About
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.bio}>
                  {user.bio}
                </ThemedText>
              </View>
            ) : null}

            <AuthPrimaryButton
              label="Send Message"
              pending={findConversation.isPending}
              onPress={() =>
                findConversation.mutate(user.id, {
                  onSuccess: ({ conversationId }) =>
                    router.push({
                      pathname: '/chat/[id]',
                      params: conversationId
                        ? { id: conversationId }
                        : { id: 'new', participantId: user.id },
                    }),
                })
              }
            />
            {findConversation.isError ? (
              <ThemedText style={styles.startChatError}>
                {findConversation.error instanceof Error
                  ? findConversation.error.message
                  : 'Could not open this conversation.'}
              </ThemedText>
            ) : null}
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const card = isDark ? 'rgba(38,32,52,0.96)' : 'rgba(255,255,255,0.94)';
  const border = isDark ? 'rgba(190,176,255,0.14)' : 'rgba(97,76,190,0.10)';

  return StyleSheet.create({
    scrollContent: { flexGrow: 1, paddingBottom: 40 },
    safeArea: { width: '100%', alignItems: 'center', paddingHorizontal: 20 },
    content: { width: '100%', maxWidth: 560, gap: 16 },
    header: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },
    icon: { color: isDark ? '#F5F1FF' : '#312C3C' },
    headerTitle: { fontSize: 15, lineHeight: 21 },
    headerSpacer: { width: 42 },
    pressed: { opacity: 0.7 },
    heroCard: {
      alignItems: 'center',
      borderRadius: 28,
      padding: 26,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },
    avatar: { width: 112, height: 112, borderRadius: 56, marginBottom: 16 },
    avatarPlaceholder: {
      width: 112,
      height: 112,
      borderRadius: 56,
      marginBottom: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#55488A' : '#E8E2FF',
    },
    initials: {
      color: isDark ? '#F1EDFF' : '#5948A9',
      fontSize: 34,
      lineHeight: 42,
      fontWeight: '700',
    },
    displayName: { fontSize: 27, lineHeight: 34, textAlign: 'center' },
    countryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
    muted: { color: isDark ? '#B8B1C8' : '#716A7C', fontSize: 13, lineHeight: 18 },
    sectionCard: {
      borderRadius: 23,
      padding: 18,
      gap: 15,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },
    sectionTitle: { fontSize: 15, lineHeight: 21 },
    languageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    flagCircle: {
      width: 44,
      height: 44,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8F6FC',
    },
    flag: { fontSize: 23, lineHeight: 28 },
    languageCopy: { flex: 1 },
    eyebrow: { color: isDark ? '#AAA3B8' : '#7B7486', fontSize: 10, lineHeight: 14 },
    languageName: { fontSize: 14, lineHeight: 20 },
    divider: { height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E9E5EE' },
    levelPill: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: isDark ? 'rgba(138,116,255,0.18)' : '#EEE9FF',
    },
    levelText: {
      color: isDark ? '#C9BEFF' : '#604DB7',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
    },
    interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    interestPill: {
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
      backgroundColor: isDark ? '#35303F' : '#F1EEF4',
    },
    sharedInterestPill: {
      backgroundColor: isDark ? 'rgba(255,193,92,0.17)' : '#FFF0CB',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,205,120,0.28)' : '#F4D388',
    },
    interestText: { color: isDark ? '#B9B3C3' : '#6D6677', fontSize: 11, lineHeight: 16 },
    sharedInterestText: { color: isDark ? '#FFD58F' : '#805A0B', fontWeight: '600' },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E7AD42' },
    legendText: { color: isDark ? '#A9A2B4' : '#7B7485', fontSize: 10, lineHeight: 14 },
    bio: { fontSize: 13, lineHeight: 21 },
    centered: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    loadingText: { fontSize: 13, marginTop: 14 },
    errorTitle: { fontSize: 18, textAlign: 'center', marginBottom: 8 },
    errorMessage: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
    errorButton: {
      marginTop: 20,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 10,
      backgroundColor: '#6654C7',
    },
    errorButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    startChatError: {
      color: isDark ? '#FFB7BF' : '#A93643',
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },
  });
};
