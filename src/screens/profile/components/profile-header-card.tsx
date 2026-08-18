import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import type { AuthUser } from '@/screens/auth/types';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getCountryName } from '@/screens/onboarding/data';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { getInitials } from '../language-flags';
import { useProfileStyles } from '../styles/profile-styles';

type Props = {
  user: AuthUser;
  avatarUri: string | null | undefined;
  avatarPending: boolean;
  avatarError: string | null;
  onChooseAvatar: () => void;
  onRemovePhoto: () => void;
};

export function ProfileHeaderCard({
  user,
  avatarUri,
  avatarPending,
  avatarError,
  onChooseAvatar,
  onRemovePhoto,
}: Props) {
  const styles = useProfileStyles();
  const displayName = user.displayName?.trim() || user.email.split('@')[0];

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          disabled={avatarPending}
          onPress={onChooseAvatar}
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
            onPress={onRemovePhoto}
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

      <AuthPrimaryButton label="Edit Profile" onPress={() => router.push('/profile/edit')} />
    </View>
  );
}
