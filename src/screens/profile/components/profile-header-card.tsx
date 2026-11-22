import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import type { AuthUser } from '@/screens/auth/types';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getCountryName } from '@/screens/onboarding/data';
import { IslandAvatarAnchor } from '@/shared/components/island-header/island-avatar';
import type { IslandCollapse } from '@/shared/components/island-header/use-island-collapse';
import { ContactAvatar } from '@/shared/components/ui/contact-avatar';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useProfileStyles } from '../styles/profile-styles';

export const PROFILE_AVATAR_SIZE = 104;

export function getProfileDisplayName(user: AuthUser) {
  return user.displayName?.trim() || user.email.split('@')[0];
}

type AvatarButtonProps = {
  user: AuthUser;
  avatarUri: string | null | undefined;
  avatarPending: boolean;
  onChooseAvatar: () => void;
  onRemovePhoto: () => void;
};

/** Your photo with the camera badge; tapping offers Choose / Remove. Rendered in the island overlay. */
export function ProfileAvatarButton({
  user,
  avatarUri,
  avatarPending,
  onChooseAvatar,
  onRemovePhoto,
}: AvatarButtonProps) {
  const styles = useProfileStyles();
  const { t } = useTranslation(['profile', 'common']);

  const openPhotoActions = () => {
    if (!user.avatarUrl) {
      onChooseAvatar();
      return;
    }
    Alert.alert(t('header.changePhoto'), undefined, [
      { text: t('header.choosePhoto'), onPress: onChooseAvatar },
      { text: t('header.removePhoto'), style: 'destructive', onPress: onRemovePhoto },
      { text: t('common:actions.cancel'), style: 'cancel' },
    ]);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('header.changePhoto')}
      disabled={avatarPending}
      onPress={openPhotoActions}
      style={({ pressed }) => pressed && styles.pressed}>
      <ContactAvatar
        avatarUrl={avatarUri}
        name={getProfileDisplayName(user)}
        size={PROFILE_AVATAR_SIZE}
      />
      {avatarPending ? (
        <View style={styles.pendingOverlay}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

/** Camera badge on your photo; passed to the island overlay so it fades out first. */
export function ProfileAvatarBadge() {
  const styles = useProfileStyles();
  return (
    <View pointerEvents="none" style={styles.editBadge}>
      <SymbolView
        name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
        size={14}
        tintColor="#FFFFFF"
      />
    </View>
  );
}

type Props = {
  collapse: IslandCollapse;
  user: AuthUser;
  avatarError: string | null;
};

/** Open profile header: avatar slot, name, country, and a quiet edit action. No card around it. */
export function ProfileHeaderCard({ collapse, user, avatarError }: Props) {
  const styles = useProfileStyles();
  const { t } = useTranslation('profile');

  return (
    <View style={styles.hero}>
      <View style={styles.avatarButton}>
        <IslandAvatarAnchor collapse={collapse} size={PROFILE_AVATAR_SIZE} />
      </View>

      <ThemedText accessibilityRole="header" style={styles.displayName}>
        {getProfileDisplayName(user)}
      </ThemedText>
      {user.country ? (
        <View style={styles.countryRow}>
          <CountryFlag country={user.country} size={16} boxSize={18} />
          <ThemedText style={styles.countryText}>{getCountryName(user.country)}</ThemedText>
        </View>
      ) : null}
      {avatarError ? <ThemedText style={styles.error}>{avatarError}</ThemedText> : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/profile/edit')}
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
          size={14}
          weight="semibold"
          tintColor={styles.secondaryButtonText.color}
        />
        <ThemedText style={styles.secondaryButtonText}>{t('header.editProfile')}</ThemedText>
      </Pressable>
    </View>
  );
}
