import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { getInterestLabel, InterestIcon } from '@/shared/components/ui/interest-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { usePublicUser } from '@/screens/discover/hooks';
import { useFindDirectConversation } from '@/screens/chat/hooks';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getCountryName } from '@/screens/onboarding/data';
import { LanguageFlag } from '@/screens/profile/components/language-flag';
import { getInitials } from '@/screens/profile/language-flags';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { useAuthStore } from '@/shared/store/auth-store';

import { usePublicProfileStyles } from './styles/public-profile-styles';

const titleCase = (value: string) => value[0].toUpperCase() + value.slice(1);

export default function PublicProfile() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    returnToConversationId?: string | string[];
  }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const returnToConversationId = Array.isArray(params.returnToConversationId)
    ? params.returnToConversationId[0]
    : params.returnToConversationId;
  const styles = usePublicProfileStyles();
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

            <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
              <ThemedText type="bold" style={styles.sectionTitle}>
                Languages
              </ThemedText>
              <View style={styles.languageRow}>
                <LanguageFlag language={user.nativeLanguage} />
                <View style={styles.languageCopy}>
                  <ThemedText style={styles.eyebrow}>Native language</ThemedText>
                  <ThemedText type="bold" style={styles.languageName}>
                    {user.nativeLanguage || 'Not added'}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.languageRow}>
                <LanguageFlag language={user.learningLanguage} />
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
              <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
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
                        <InterestIcon
                          color={
                            isShared ? styles.sharedInterestText.color : styles.interestText.color
                          }
                          interest={interest}
                          size={13}
                        />
                        <ThemedText
                          style={[styles.interestText, isShared && styles.sharedInterestText]}>
                          {getInterestLabel(interest)}
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
              <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
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
                  onSuccess: ({ conversationId }) => {
                    if (
                      conversationId &&
                      conversationId === returnToConversationId &&
                      router.canGoBack()
                    ) {
                      router.back();
                      return;
                    }

                    router.push({
                      pathname: '/chat/[id]',
                      params: conversationId
                        ? { id: conversationId }
                        : { id: 'new', participantId: user.id },
                    });
                  },
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
