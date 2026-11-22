import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/theme-provider';
import {
  removeActiveAccount,
  switchToSavedAccount,
} from '@/screens/auth/_shared/utils/session-transition';
import { CollapsedTitleBar } from '@/shared/components/island-header/collapsed-title-bar';
import { IslandAvatar } from '@/shared/components/island-header/island-avatar';
import { useIslandCollapse } from '@/shared/components/island-header/use-island-collapse';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAuthStore } from '@/shared/store/auth-store';
import { useUserStore } from '@/shared/store/user.store';

import { ProfileAccounts } from './components/profile-accounts';
import {
  getProfileDisplayName,
  PROFILE_AVATAR_SIZE,
  ProfileAvatarBadge,
  ProfileAvatarButton,
  ProfileHeaderCard,
} from './components/profile-header-card';
import { ListRow, ListSection } from '@/shared/components/ui/grouped-list';

import { ProfileDetails, ProfileLanguages } from './components/profile-sections';
import {
  useChangeAvatarMutation,
  useRefreshProfileMutation,
  useRemoveAvatarMutation,
} from './hooks';
import { useProfileStyles } from './styles/profile-styles';
import { useTranslation } from 'react-i18next';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';

export default function ProfileScreen() {
  const styles = useProfileStyles();
  const tokens = useUiTokens();
  const collapse = useIslandCollapse();
  const { theme } = useAppTheme();
  const { t } = useTranslation(['profile', 'common', 'onboarding']);
  const user = useUserStore((state) => state.user);
  const users = useUserStore((state) => state.users);
  const activeAccountId = useAuthStore((state) => state.activeAccountId);
  const changeAvatar = useChangeAvatarMutation();
  const removeAvatar = useRemoveAvatarMutation();
  const refreshProfile = useRefreshProfileMutation();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [switchingAccountId, setSwitchingAccountId] = useState<string | null>(null);
  const refreshColor = tokens.loader;

  if (!user) return null;

  const chooseAvatar = async () => {
    setAvatarError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAvatarError(t('onboarding:step1.photoPermission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (result.canceled) return;

    setPreviewUri(result.assets[0].uri);
    try {
      await changeAvatar.mutateAsync(result.assets[0]);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : t('photo.updateFailed'));
    } finally {
      setPreviewUri(null);
    }
  };

  const removePhoto = async () => {
    setAvatarError(null);
    try {
      await removeAvatar.mutateAsync();
      setPreviewUri(null);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : t('photo.removeFailed'));
    }
  };

  const onRefresh = async () => {
    try {
      await refreshProfile.mutateAsync();
    } catch (error) {
      Alert.alert(
        t('refreshFailed'),
        error instanceof Error ? error.message : t('common:errors.tryAgain'),
      );
    }
  };

  const logout = async () => {
    await removeActiveAccount();
  };

  const switchAccount = async (userId: string) => {
    setSwitchingAccountId(userId);
    try {
      await switchToSavedAccount(userId);
    } finally {
      setSwitchingAccountId(null);
    }
  };

  const confirmLogout = () => {
    Alert.alert(t('logout.confirmTitle'), t('logout.confirmMessage'), [
      { text: t('common:actions.cancel'), style: 'cancel' },
      { text: t('logout.action'), style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const settingsButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('openSettings')}
      hitSlop={8}
      onPress={() => router.push('/profile/settings')}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <SymbolView
        name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
        size={19}
        weight="medium"
        tintColor={styles.iconButtonIcon.color}
      />
    </Pressable>
  );

  return (
    <GradientBackground>
      {/* Safe area wraps the scroll view (as on Chats) so the pull-to-refresh spinner appears
          below the status bar instead of hidden under it. */}
      <SafeAreaView style={styles.screen} edges={['top']}>
        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, { minHeight: collapse.contentMinHeight }]}
          onContentSizeChange={collapse.remeasure}
          onLayout={collapse.remeasure}
          onScroll={collapse.scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshProfile.isPending}
              onRefresh={() => void onRefresh()}
              colors={[refreshColor]}
              progressBackgroundColor={theme === 'dark' ? '#1F1D27' : '#FFFFFF'}
              tintColor={refreshColor}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.safeArea}>
            <View onLayout={collapse.remeasure} style={styles.content}>
              <View style={styles.titleRow}>
                <ThemedText accessibilityRole="header" style={styles.screenTitle}>
                  {t('title')}
                </ThemedText>
                {settingsButton}
              </View>

              <ProfileHeaderCard collapse={collapse} user={user} avatarError={avatarError} />
              <ProfileAccounts
                users={users}
                activeAccountId={activeAccountId ?? user.id}
                switchingAccountId={switchingAccountId}
                onSwitchAccount={(userId) => void switchAccount(userId)}
              />
              <ProfileLanguages user={user} />
              <ProfileDetails user={user} />
              <ListSection>
                <ListRow
                  destructive
                  icon={{
                    ios: 'rectangle.portrait.and.arrow.right',
                    android: 'logout',
                    web: 'logout',
                  }}
                  onPress={confirmLogout}
                  title={t('logout.action')}
                />
              </ListSection>
            </View>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>

      <CollapsedTitleBar
        collapse={collapse}
        right={settingsButton}
        title={getProfileDisplayName(user)}
      />
      <IslandAvatar
        badge={<ProfileAvatarBadge />}
        blurImageUri={previewUri ?? user.avatarUrl}
        collapse={collapse}
        size={PROFILE_AVATAR_SIZE}>
        <ProfileAvatarButton
          avatarPending={changeAvatar.isPending || removeAvatar.isPending}
          avatarUri={previewUri ?? user.avatarUrl}
          onChooseAvatar={() => void chooseAvatar()}
          onRemovePhoto={() => void removePhoto()}
          user={user}
        />
      </IslandAvatar>
    </GradientBackground>
  );
}
