import { SymbolView } from '@/shared/components/ui/symbol-view';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePublicUser } from '@/screens/discover/hooks';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getCountryName } from '@/screens/onboarding/data';
import { ProfileLanguages } from '@/screens/profile/components/profile-sections';
import { SettingsHeader } from '@/screens/profile/components/settings-header';
import { CollapsedTitleBar } from '@/shared/components/island-header/collapsed-title-bar';
import { IslandAvatar, IslandAvatarAnchor } from '@/shared/components/island-header/island-avatar';
import { useIslandCollapse } from '@/shared/components/island-header/use-island-collapse';
import { ContactAvatar } from '@/shared/components/ui/contact-avatar';
import { ListSection } from '@/shared/components/ui/grouped-list';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { getInterestLabel, InterestIcon } from '@/shared/components/ui/interest-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useChatStore } from '@/shared/store/chat-store';
import { useUserStore } from '@/shared/store/user.store';

import { usePublicProfileStyles } from './styles/public-profile-styles';
import { useTranslation } from 'react-i18next';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';

const PUBLIC_AVATAR_SIZE = 104;

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
  const collapse = useIslandCollapse();
  const tokens = useUiTokens();
  const { t } = useTranslation(['profile', 'common']);
  const currentUser = useUserStore((state) => state.user);
  const query = usePublicUser(id);
  const directConversationId = useChatStore(
    (state) =>
      state.conversations.find(
        (conversation) =>
          conversation.type !== 'GROUP' &&
          conversation.participants.some((participant) => participant.id === id),
      )?.id,
  );

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else router.replace('/(tabs)/discover');
  };

  if (query.isPending) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={tokens.loader} />
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
  const openChat = () => {
    if (returnToConversationId && router.canGoBack()) {
      router.back();
      return;
    }

    router.push({
      pathname: '/chat/[id]',
      params: directConversationId
        ? { id: directConversationId }
        : { id: 'new', participantId: user.id },
    });
  };

  const displayName = user.displayName || t('public.fallbackName');

  return (
    <GradientBackground>
      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { minHeight: collapse.contentMinHeight }]}
        onContentSizeChange={collapse.remeasure}
        onLayout={collapse.remeasure}
        onScroll={collapse.scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <View onLayout={collapse.remeasure} style={styles.content}>
            <SettingsHeader
              fallbackHref="/(tabs)/discover"
              title={isOwnProfile ? t('public.yourProfile') : t('public.partnerProfile')}
            />

            <View style={styles.hero}>
              <IslandAvatarAnchor collapse={collapse} size={PUBLIC_AVATAR_SIZE} />
              <ThemedText accessibilityRole="header" style={styles.displayName}>
                {displayName}
              </ThemedText>
              {user.country ? (
                <View style={styles.countryRow}>
                  <CountryFlag country={user.country} size={16} boxSize={18} />
                  <ThemedText style={styles.muted}>{getCountryName(user.country)}</ThemedText>
                </View>
              ) : null}
              {!isOwnProfile ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={openChat}
                  style={({ pressed }) => [styles.messageButton, pressed && styles.pressed]}>
                  <SymbolView
                    name={{ ios: 'bubble.left.fill', android: 'chat', web: 'chat' }}
                    size={16}
                    tintColor={styles.messageButtonText.color}
                  />
                  <ThemedText style={styles.messageButtonText}>
                    {t('public.sendMessage')}
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>

            <ProfileLanguages user={user} />

            {user.interests.length ? (
              <ListSection
                footer={!isOwnProfile && shared.size ? t('public.sharedWithYou') : undefined}
                title={t('sections.interests')}>
                <View style={styles.interests}>
                  {user.interests.map((interest) => {
                    const isShared = !isOwnProfile && shared.has(interest);
                    return (
                      <View
                        key={interest}
                        style={[styles.interestPill, isShared && styles.sharedInterestPill]}>
                        <InterestIcon
                          color={
                            isShared ? styles.sharedInterestText.color : styles.interestIcon.color
                          }
                          interest={interest}
                          size={14}
                        />
                        <ThemedText
                          style={[styles.interestText, isShared && styles.sharedInterestText]}>
                          {getInterestLabel(interest)}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              </ListSection>
            ) : null}

            {user.bio ? (
              <ListSection title={t('public.about')}>
                <View style={styles.sectionBody}>
                  <ThemedText style={styles.bio}>{user.bio}</ThemedText>
                </View>
              </ListSection>
            ) : null}
          </View>
        </SafeAreaView>
      </Animated.ScrollView>

      <CollapsedTitleBar
        collapse={collapse}
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common:actions.goBack')}
            hitSlop={8}
            onPress={goBack}
            style={({ pressed }) => [styles.barButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              size={18}
              weight="semibold"
              tintColor={styles.barButtonIcon.color}
            />
          </Pressable>
        }
        title={displayName}
      />
      <IslandAvatar blurImageUri={user.avatarUrl} collapse={collapse} size={PUBLIC_AVATAR_SIZE}>
        <ContactAvatar avatarUrl={user.avatarUrl} name={displayName} size={PUBLIC_AVATAR_SIZE} />
      </IslandAvatar>
    </GradientBackground>
  );
}
