import { SymbolView } from '@/shared/components/ui/symbol-view';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { useFindDirectConversation } from '@/screens/chat/hooks';
import { usePublicUser } from '@/screens/discover/hooks';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getCountryName, getLanguageLabel } from '@/screens/onboarding/data';
import { LanguageFlag } from '@/screens/profile/components/language-flag';
import { getInitials } from '@/screens/profile/utils/language-flags';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { getInterestLabel, InterestIcon } from '@/shared/components/ui/interest-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useUserStore } from '@/shared/store/user.store';

import { usePublicProfileStyles } from './styles/public-profile-styles';
import { useTranslation } from 'react-i18next';
import { getLevelLabel } from '@/shared/constants/language-levels';

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
  const { t } = useTranslation(['profile', 'common']);
  const currentUser = useUserStore((state) => state.user);
  const query = usePublicUser(id);
  const findConversation = useFindDirectConversation();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else router.replace('/(tabs)/discover');
  };

  if (query.isPending) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#6654C7" />
          <ThemedText themeColor="textSecondary" style={styles.loadingText}>
            {t('public.loading')}
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
            {t('public.loadFailed')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.errorMessage}>
            {query.error instanceof Error ? query.error.message : t('public.mayNotExist')}
          </ThemedText>
          <Pressable onPress={goBack} style={styles.errorButton}>
            <ThemedText style={styles.errorButtonText}>{t('public.backToDiscover')}</ThemedText>
          </Pressable>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const user = query.data.user;
  if (user.isDeleted) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <ThemedText type="bold" style={styles.errorTitle}>
            {t('public.deletedTitle')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.errorMessage}>
            {t('public.deletedMessage')}
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={goBack} style={styles.errorButton}>
            <ThemedText style={styles.errorButtonText}>{t('common:actions.goBack')}</ThemedText>
          </Pressable>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const shared = new Set(currentUser?.interests ?? []);
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common:actions.back')}
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
                {isOwnProfile ? t('public.yourProfile') : t('public.partnerProfile')}
              </ThemedText>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.heroCard}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} contentFit="cover" style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <ThemedText style={styles.initials}>
                    {getInitials(user.displayName, '')}
                  </ThemedText>
                </View>
              )}
              <ThemedText type="title" style={styles.displayName}>
                {user.displayName || t('public.fallbackName')}
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
                {t('sections.languages')}
              </ThemedText>
              <View style={styles.languageRow}>
                <LanguageFlag language={user.nativeLanguage} />
                <View style={styles.languageCopy}>
                  <ThemedText style={styles.eyebrow}>{t('sections.nativeLanguage')}</ThemedText>
                  <ThemedText type="bold" style={styles.languageName}>
                    {getLanguageLabel(user.nativeLanguage) || t('sections.notAdded')}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.languageRow}>
                <LanguageFlag language={user.learningLanguage} />
                <View style={styles.languageCopy}>
                  <ThemedText style={styles.eyebrow}>{t('sections.learning')}</ThemedText>
                  <ThemedText type="bold" style={styles.languageName}>
                    {getLanguageLabel(user.learningLanguage) || t('sections.notAdded')}
                  </ThemedText>
                </View>
                {user.proficiencyLevel ? (
                  <View style={styles.levelPill}>
                    <ThemedText style={styles.levelText}>
                      {getLevelLabel(user.proficiencyLevel)}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>

            {user.interests.length ? (
              <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
                <ThemedText type="bold" style={styles.sectionTitle}>
                  {t('sections.interests')}
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
                  <ThemedText style={styles.legendText}>{t('public.sharedWithYou')}</ThemedText>
                </View>
              </View>
            ) : null}

            {user.bio ? (
              <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
                <ThemedText type="bold" style={styles.sectionTitle}>
                  {t('public.about')}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.bio}>
                  {user.bio}
                </ThemedText>
              </View>
            ) : null}

            {!isOwnProfile ? (
              <>
                <AuthPrimaryButton
                  label={t('public.sendMessage')}
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
                      : t('public.openConversationFailed')}
                  </ThemedText>
                ) : null}
              </>
            ) : null}
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}
