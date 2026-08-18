import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { InputWithIcon } from '@/shared/components/ui/input-with-icon';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { OnboardingCard } from '@/screens/onboarding/components/onboarding-card';
import { OnboardingScreen } from '@/screens/onboarding/components/onboarding-screen';
import { useUploadAvatarMutation } from '@/screens/onboarding/hooks';
import { basicInfoSchema, type BasicInfoFormValues } from '@/screens/onboarding/schemas';
import AuthFormField from '@/screens/auth/_shared/components/auth-form-field';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { useOnboardingStore } from '@/shared/store/onboardingStore';
import { useTheme } from '@/shared/hooks/use-theme';
import { useState } from 'react';

export default function OnboardingStepOne() {
  const theme = useTheme();
  const styles = useStyles();
  const displayName = useOnboardingStore((state) => state.displayName);
  const avatarUrl = useOnboardingStore((state) => state.avatarUrl);
  const update = useOnboardingStore((state) => state.update);
  const avatarMutation = useUploadAvatarMutation();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: { displayName },
  });

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
      const response = await avatarMutation.mutateAsync(asset);
      update({ avatarUrl: response.avatarUrl });
    } catch (error) {
      setPreviewUri(null);
      setAvatarError(error instanceof Error ? error.message : 'Unable to upload the photo.');
    }
  };

  const onNext = ({ displayName: nextDisplayName }: BasicInfoFormValues) => {
    update({ displayName: nextDisplayName });
    router.push('/onboarding/step2');
  };

  const avatarSource = previewUri ?? avatarUrl;

  return (
    <OnboardingScreen
      step={1}
      title="Let’s start with you"
      subtitle="Add the name people will see and an optional profile photo.">
      <OnboardingCard>
        <View style={styles.avatarSection}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose profile photo"
            disabled={avatarMutation.isPending}
            onPress={() => void chooseAvatar()}
            style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
            {avatarSource ? (
              <Image source={{ uri: avatarSource }} contentFit="cover" style={styles.avatarImage} />
            ) : (
              <SymbolView
                name={{
                  ios: 'person.crop.circle.fill',
                  android: 'account_circle',
                  web: 'account_circle',
                }}
                size={72}
                tintColor={styles.avatarIcon.color}
              />
            )}
            <View style={styles.editBadge}>
              {avatarMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <SymbolView
                  name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
                  size={16}
                  tintColor="#FFFFFF"
                />
              )}
            </View>
          </Pressable>
          <View style={styles.avatarCopy}>
            <ThemedText type="bold">Profile photo</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.avatarHint}>
              Optional · tap to choose
            </ThemedText>
          </View>
        </View>

        {avatarError ? <ThemedText style={styles.error}>{avatarError}</ThemedText> : null}

        <AuthFormField label="Display name" error={errors.displayName?.message}>
          <Controller
            control={control}
            name="displayName"
            render={({ field: { onBlur, onChange, value } }) => (
              <InputWithIcon
                icon={{ ios: 'person', android: 'person', web: 'person' }}
                iconColor={theme.textSecondary}
                hasError={Boolean(errors.displayName)}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="What should we call you?"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="done"
                onSubmitEditing={() => void handleSubmit(onNext)()}
              />
            )}
          />
        </AuthFormField>

        <AuthPrimaryButton
          label="Next"
          disabled={avatarMutation.isPending}
          onPress={() => void handleSubmit(onNext)()}
        />
      </OnboardingCard>
    </OnboardingScreen>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    avatarSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatarButton: {
      width: 92,
      height: 92,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 46,
      backgroundColor: isDark ? '#29213A' : '#EEEAF8',
      borderWidth: 2,
      borderColor: isDark ? '#4A405F' : '#DDD5F1',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 46,
    },
    avatarIcon: {
      color: isDark ? '#8F82BE' : '#A093D0',
    },
    editBadge: {
      position: 'absolute',
      right: -2,
      bottom: 1,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      backgroundColor: '#6654C7',
      borderWidth: 2,
      borderColor: isDark ? '#1F192F' : '#FFFFFF',
    },
    avatarCopy: {
      flex: 1,
      gap: 2,
    },
    avatarHint: {
      fontSize: 12,
      lineHeight: 18,
    },
    pressed: {
      opacity: 0.7,
    },
    error: {
      marginTop: -8,
      color: isDark ? '#FF9A9A' : '#B42318',
      fontSize: 12,
      lineHeight: 17,
    },
  });
};
