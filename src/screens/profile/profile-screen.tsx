import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/theme-provider';
import {
  removeActiveAccount,
  switchToSavedAccount,
} from '@/screens/auth/_shared/utils/session-transition';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAuthStore } from '@/shared/store/auth-store';
import { useUserStore } from '@/shared/store/user.store';

import { ProfileAccounts } from './components/profile-accounts';
import { ProfileHeaderCard } from './components/profile-header-card';
import { ProfileDetails, ProfileLanguages } from './components/profile-sections';
import {
  useChangeAvatarMutation,
  useRefreshProfileMutation,
  useRemoveAvatarMutation,
} from './hooks';
import { useProfileStyles } from './styles/profile-styles';

export default function ProfileScreen() {
  const styles = useProfileStyles();
  const { theme } = useAppTheme();
  const user = useUserStore((state) => state.user);
  const users = useUserStore((state) => state.users);
  const activeAccountId = useAuthStore((state) => state.activeAccountId);
  const changeAvatar = useChangeAvatarMutation();
  const removeAvatar = useRemoveAvatarMutation();
  const refreshProfile = useRefreshProfileMutation();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [switchingAccountId, setSwitchingAccountId] = useState<string | null>(null);
  const refreshColor = theme === 'dark' ? '#B8A9FF' : '#6654C7';

  if (!user) return null;

  const chooseAvatar = async () => {
    setAvatarError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAvatarError('Photo access is required to choose an avatar.');
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
      setAvatarError(error instanceof Error ? error.message : 'Unable to update your photo.');
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
      setAvatarError(error instanceof Error ? error.message : 'Unable to remove your photo.');
    }
  };

  const onRefresh = async () => {
    try {
      await refreshProfile.mutateAsync();
    } catch (error) {
      Alert.alert(
        'Could not refresh profile',
        error instanceof Error ? error.message : 'Try again.',
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
    Alert.alert(
      'Log out of this account?',
      'Other saved accounts will stay signed in on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: () => void logout() },
      ],
    );
  };

  return (
    <GradientBackground>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshProfile.isPending}
            onRefresh={() => void onRefresh()}
            colors={[refreshColor]}
            progressBackgroundColor={theme === 'dark' ? '#251F33' : '#FFFFFF'}
            tintColor={refreshColor}
          />
        }
        showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <View style={styles.titleCopy}>
                <ThemedText type="title" style={styles.screenTitle}>
                  My profile
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.screenSubtitle}>
                  Your language exchange identity
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open profile settings"
                hitSlop={8}
                onPress={() => router.push('/profile/settings')}
                style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
                  size={21}
                  weight="semibold"
                  tintColor={styles.settingsIcon.color}
                />
              </Pressable>
            </View>

            <ProfileHeaderCard
              user={user}
              avatarUri={previewUri ?? user.avatarUrl}
              avatarPending={changeAvatar.isPending || removeAvatar.isPending}
              avatarError={avatarError}
              onChooseAvatar={() => void chooseAvatar()}
              onRemovePhoto={() => void removePhoto()}
            />
            <ProfileAccounts
              users={users}
              activeAccountId={activeAccountId ?? user.id}
              switchingAccountId={switchingAccountId}
              onSwitchAccount={(userId) => void switchAccount(userId)}
            />
            <ProfileLanguages user={user} />
            <ProfileDetails user={user} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log out"
              onPress={confirmLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
              <SymbolView
                name={{
                  ios: 'rectangle.portrait.and.arrow.right',
                  android: 'logout',
                  web: 'logout',
                }}
                size={19}
                weight="semibold"
                tintColor={styles.logoutText.color}
              />
              <ThemedText style={styles.logoutText}>Log out</ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}
