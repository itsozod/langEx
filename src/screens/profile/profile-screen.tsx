import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/theme-provider';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chatStore';
import { useOnboardingStore } from '@/shared/store/onboardingStore';

import { ProfileAppearance } from './components/profile-appearance';
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
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const resetChats = useChatStore((state) => state.reset);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const queryClient = useQueryClient();
  const changeAvatar = useChangeAvatarMutation();
  const removeAvatar = useRemoveAvatarMutation();
  const refreshProfile = useRefreshProfileMutation();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
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
    await queryClient.cancelQueries();
    queryClient.clear();
    resetChats();
    resetOnboarding();
    clearSession();
  };

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in again to access your profile and chats.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void logout() },
    ]);
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
              <ThemedText type="title" style={styles.screenTitle}>
                My profile
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.screenSubtitle}>
                Your language exchange identity
              </ThemedText>
            </View>

            <ProfileHeaderCard
              user={user}
              avatarUri={previewUri ?? user.avatarUrl}
              avatarPending={changeAvatar.isPending || removeAvatar.isPending}
              avatarError={avatarError}
              onChooseAvatar={() => void chooseAvatar()}
              onRemovePhoto={() => void removePhoto()}
            />
            <ProfileLanguages user={user} />
            <ProfileDetails user={user} />
            <ProfileAppearance />

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
