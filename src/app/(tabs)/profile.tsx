import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme, type ThemePreference } from '@/providers/theme-provider';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getCountryName } from '@/screens/onboarding/data';
import { useChangeAvatarMutation, useRemoveAvatarMutation } from '@/screens/profile/hooks';
import { getInitials, getLanguageFlag } from '@/screens/profile/language-flags';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chatStore';
import { useOnboardingStore } from '@/shared/store/onboardingStore';

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: SymbolViewProps['name'];
}[] = [
  {
    value: 'system',
    label: 'System',
    icon: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  },
  {
    value: 'light',
    label: 'Light',
    icon: { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' },
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
  },
];

export default function Profile() {
  const styles = useStyles();
  const { preference, setPreference } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const resetChats = useChatStore((state) => state.reset);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const queryClient = useQueryClient();
  const changeAvatarMutation = useChangeAvatarMutation();
  const removeAvatarMutation = useRemoveAvatarMutation();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  if (!user) return null;

  const displayName = user.displayName?.trim() || user.email.split('@')[0];
  const avatarUri = previewUri ?? user.avatarUrl;
  const avatarPending = changeAvatarMutation.isPending || removeAvatarMutation.isPending;

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

    const asset = result.assets[0];
    setPreviewUri(asset.uri);

    try {
      await changeAvatarMutation.mutateAsync(asset);
      setPreviewUri(null);
    } catch (error) {
      setPreviewUri(null);
      setAvatarError(error instanceof Error ? error.message : 'Unable to update your photo.');
    }
  };

  const removePhoto = async () => {
    setAvatarError(null);
    try {
      await removeAvatarMutation.mutateAsync();
      setPreviewUri(null);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Unable to remove your photo.');
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
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => void logout(),
      },
    ]);
  };

  return (
    <GradientBackground>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <View>
                <ThemedText type="title" style={styles.screenTitle}>
                  My profile
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.screenSubtitle}>
                  Your language exchange identity
                </ThemedText>
              </View>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.avatarArea}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change profile photo"
                  disabled={avatarPending}
                  onPress={() => void chooseAvatar()}
                  style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} contentFit="cover" style={styles.avatar} />
                  ) : (
                    <View style={styles.initialsAvatar}>
                      <ThemedText style={styles.initials}>
                        {getInitials(user.displayName, user.email)}
                      </ThemedText>
                    </View>
                  )}
                  <View style={styles.editBadge}>
                    {avatarPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <SymbolView
                        name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                        size={16}
                        weight="semibold"
                        tintColor="#FFFFFF"
                      />
                    )}
                  </View>
                </Pressable>

                {user.avatarUrl ? (
                  <Pressable
                    disabled={avatarPending}
                    hitSlop={8}
                    onPress={() => void removePhoto()}
                    style={({ pressed }) => pressed && styles.pressed}>
                    <ThemedText style={styles.removePhoto}>Remove photo</ThemedText>
                  </Pressable>
                ) : null}

                {avatarError ? <ThemedText style={styles.error}>{avatarError}</ThemedText> : null}
              </View>

              <View style={styles.identity}>
                <ThemedText type="title" style={styles.displayName}>
                  {displayName}
                </ThemedText>
                {user.country ? (
                  <View style={styles.countryRow}>
                    <CountryFlag country={user.country} size={17} boxSize={23} />
                    <ThemedText themeColor="textSecondary" style={styles.countryText}>
                      {getCountryName(user.country)}
                    </ThemedText>
                  </View>
                ) : null}
              </View>

              <AuthPrimaryButton
                label="Edit Profile"
                onPress={() => router.push('/profile/edit')}
              />
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
                  <ThemedText themeColor="textSecondary" style={styles.eyebrow}>
                    Native language
                  </ThemedText>
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
                  <ThemedText themeColor="textSecondary" style={styles.eyebrow}>
                    Learning
                  </ThemedText>
                  <ThemedText type="bold" style={styles.languageName}>
                    {user.learningLanguage || 'Not added'}
                  </ThemedText>
                </View>
                {user.proficiencyLevel ? (
                  <View style={styles.levelPill}>
                    <ThemedText style={styles.levelText}>
                      {user.proficiencyLevel[0].toUpperCase() + user.proficiencyLevel.slice(1)}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>

            {user.interests?.length ? (
              <View style={styles.sectionCard}>
                <ThemedText type="bold" style={styles.sectionTitle}>
                  Interests
                </ThemedText>
                <View style={styles.interests}>
                  {user.interests.map((interest) => (
                    <View key={interest} style={styles.interestPill}>
                      <ThemedText style={styles.interestText}>{interest}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {user.bio ? (
              <View style={styles.sectionCard}>
                <ThemedText type="bold" style={styles.sectionTitle}>
                  About me
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.bio}>
                  {user.bio}
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.sectionCard}>
              <View>
                <ThemedText type="bold" style={styles.sectionTitle}>
                  Appearance
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.appearanceSubtitle}>
                  Choose how LangEx looks on this device.
                </ThemedText>
              </View>

              <View accessibilityRole="radiogroup" style={styles.themeOptions}>
                {THEME_OPTIONS.map((option) => {
                  const selected = preference === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityLabel={`${option.label} theme`}
                      accessibilityState={{ selected }}
                      onPress={() => setPreference(option.value)}
                      style={({ pressed }) => [
                        styles.themeOption,
                        selected && styles.themeOptionSelected,
                        pressed && styles.pressed,
                      ]}>
                      <SymbolView
                        name={option.icon}
                        size={19}
                        tintColor={selected ? '#FFFFFF' : styles.themeOptionText.color}
                      />
                      <ThemedText
                        style={[
                          styles.themeOptionText,
                          selected && styles.themeOptionTextSelected,
                        ]}>
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

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

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 118,
    },
    safeArea: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    content: {
      width: '100%',
      maxWidth: 520,
      gap: 16,
    },
    titleRow: {
      paddingHorizontal: 2,
      paddingBottom: 4,
    },
    screenTitle: {
      fontSize: 30,
      lineHeight: 38,
      letterSpacing: -0.6,
    },
    screenSubtitle: {
      marginTop: 3,
      fontSize: 13,
      lineHeight: 19,
    },
    profileCard: {
      alignItems: 'center',
      padding: 22,
      gap: 18,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(151,134,219,0.22)' : 'rgba(91,70,176,0.10)',
      backgroundColor: isDark ? 'rgba(31,25,47,0.94)' : 'rgba(255,255,255,0.94)',
      shadowColor: isDark ? '#000000' : '#3B309E',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.2 : 0.07,
      shadowRadius: 24,
      elevation: 3,
    },
    avatarArea: {
      alignItems: 'center',
      gap: 8,
    },
    avatarButton: {
      width: 124,
      height: 124,
      borderRadius: 62,
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 62,
    },
    initialsAvatar: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 62,
      backgroundColor: isDark ? '#342A51' : '#E9E3FA',
      borderWidth: 2,
      borderColor: isDark ? '#554878' : '#D4C9F2',
    },
    initials: {
      color: isDark ? '#D6CCFF' : '#5B49B8',
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700',
    },
    editBadge: {
      position: 'absolute',
      right: 1,
      bottom: 2,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
      borderWidth: 3,
      borderColor: isDark ? '#1F192F' : '#FFFFFF',
      backgroundColor: '#6654C7',
    },
    removePhoto: {
      color: isDark ? '#C5B8FF' : '#5B49B8',
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '600',
    },
    error: {
      maxWidth: 280,
      color: isDark ? '#FFAAAA' : '#B42318',
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },
    identity: {
      alignItems: 'center',
      gap: 5,
    },
    displayName: {
      fontSize: 27,
      lineHeight: 34,
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    countryText: {
      fontSize: 13,
      lineHeight: 18,
    },
    pressed: {
      opacity: 0.65,
    },
    sectionCard: {
      padding: 20,
      gap: 16,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(151,134,219,0.18)' : 'rgba(91,70,176,0.09)',
      backgroundColor: isDark ? 'rgba(27,22,39,0.92)' : 'rgba(255,255,255,0.91)',
    },
    sectionTitle: {
      fontSize: 15,
      lineHeight: 21,
    },
    languageRow: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    flagCircle: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
      backgroundColor: isDark ? '#292238' : '#F2EEF9',
    },
    flag: {
      fontSize: 23,
      lineHeight: 30,
    },
    languageCopy: {
      flex: 1,
      gap: 1,
    },
    eyebrow: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    languageName: {
      fontSize: 15,
      lineHeight: 21,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? '#40384E' : '#E7E1EE',
    },
    levelPill: {
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(102,84,199,0.28)' : '#EEEAFB',
    },
    levelText: {
      color: isDark ? '#C9BEFF' : '#5643B4',
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '700',
    },
    interests: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 9,
    },
    interestPill: {
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: isDark ? '#2A2338' : '#F1EDF8',
    },
    interestText: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '600',
    },
    bio: {
      fontSize: 14,
      lineHeight: 23,
    },
    appearanceSubtitle: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
    },
    themeOptions: {
      flexDirection: 'row',
      gap: 9,
    },
    themeOption: {
      minHeight: 64,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#40384E' : '#E5DFEC',
      backgroundColor: isDark ? '#251F33' : '#F5F2F9',
    },
    themeOptionSelected: {
      borderColor: '#6654C7',
      backgroundColor: '#6654C7',
    },
    themeOptionText: {
      color: isDark ? '#C7BECE' : '#625A6B',
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700',
    },
    themeOptionTextSelected: {
      color: '#FFFFFF',
    },
    logoutButton: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,138,138,0.28)' : 'rgba(180,35,24,0.18)',
      backgroundColor: isDark ? 'rgba(122,37,46,0.16)' : 'rgba(255,243,242,0.9)',
    },
    logoutText: {
      color: isDark ? '#FFAAAA' : '#B42318',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
    },
  });
};
