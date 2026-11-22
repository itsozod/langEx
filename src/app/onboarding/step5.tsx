import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { OnboardingCard } from '@/screens/onboarding/components/onboarding-card';
import { OnboardingScreen } from '@/screens/onboarding/components/onboarding-screen';
import { useCompleteProfileMutation } from '@/screens/onboarding/hooks';
import { bioSchema, type BioFormValues } from '@/screens/onboarding/schemas';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useOnboardingStore } from '@/shared/store/onboarding-store';
import { useTranslation } from 'react-i18next';
import { translateMessage } from '@/shared/i18n/translate-message';

export default function OnboardingStepFive() {
  const { t } = useTranslation('onboarding');
  const styles = useStyles();
  const bio = useOnboardingStore((state) => state.bio);
  const update = useOnboardingStore((state) => state.update);
  const reset = useOnboardingStore((state) => state.reset);
  const profileMutation = useCompleteProfileMutation();
  const {
    control,
    getValues,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BioFormValues>({
    resolver: zodResolver(bioSchema),
    defaultValues: { bio },
  });

  const finish = async (nextBio: string) => {
    const trimmedBio = nextBio.trim();
    update({ bio: trimmedBio });
    const state = useOnboardingStore.getState();

    try {
      await profileMutation.mutateAsync({
        displayName: state.displayName,
        avatarUrl: state.avatarUrl,
        country: state.country,
        nativeLanguage: state.nativeLanguage,
        learningLanguage: state.learningLanguage,
        proficiencyLevel: state.proficiencyLevel,
        interests: state.interests,
        bio: trimmedBio,
      });
      reset();
      router.replace('/(tabs)');
    } catch (error) {
      setError('root.server', {
        type: 'server',
        message: error instanceof Error ? error.message : t('step5.failed'),
      });
    }
  };

  const onBack = () => {
    update({ bio: getValues('bio') });
    router.back();
  };

  const skip = () => void finish('');

  return (
    <OnboardingScreen
      step={5}
      title={t('step5.title')}
      subtitle={t('step5.subtitle')}
      onBack={onBack}
      headerAction={
        <Pressable
          hitSlop={10}
          disabled={profileMutation.isPending}
          onPress={skip}
          style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
          <ThemedText style={styles.skipText}>{t('step5.skip')}</ThemedText>
        </Pressable>
      }>
      <OnboardingCard>
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.label}>{t('step5.bio')}</ThemedText>
            <Controller
              control={control}
              name="bio"
              render={({ field: { value } }) => (
                <ThemedText themeColor="textSecondary" style={styles.characterCount}>
                  {value.length}/150
                </ThemedText>
              )}
            />
          </View>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                value={value}
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                  update({ bio: text });
                }}
                editable={!profileMutation.isPending}
                multiline
                maxLength={150}
                placeholder={t('step5.bioPlaceholder')}
                placeholderTextColor={styles.placeholder.color}
                textAlignVertical="top"
                style={[styles.textArea, errors.bio && styles.textAreaError]}
              />
            )}
          />
          {errors.bio?.message ? (
            <ThemedText style={styles.error}>{translateMessage(t, errors.bio.message)}</ThemedText>
          ) : null}
        </View>

        {errors.root?.server?.message ? (
          <View style={styles.serverError}>
            <ThemedText style={styles.serverErrorText}>{errors.root.server.message}</ThemedText>
          </View>
        ) : null}

        <AuthPrimaryButton
          label={profileMutation.isPending ? t('step5.finishing') : t('step5.finish')}
          pending={profileMutation.isPending}
          onPress={() => void handleSubmit(({ bio: nextBio }) => finish(nextBio))()}
        />
      </OnboardingCard>
    </OnboardingScreen>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    skipButton: {
      paddingVertical: 8,
    },
    skipText: {
      color: isDark ? '#A898FF' : '#5F4CC9',
      fontSize: 13,
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.6,
    },
    field: {
      gap: 8,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      color: isDark ? '#F4F2F8' : '#18151F',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    characterCount: {
      fontSize: 11,
      lineHeight: 16,
    },
    textArea: {
      minHeight: 160,
      paddingHorizontal: 15,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
      color: isDark ? '#F4F2F8' : '#18151F',
      fontFamily: 'PlusJakartaSans',
      fontSize: 15,
      lineHeight: 22,
    },
    textAreaError: {
      borderColor: '#D2364B',
    },
    placeholder: {
      color: isDark ? '#6E6979' : '#A9A4B1',
    },
    error: {
      color: isDark ? '#FF6B7D' : '#D2364B',
      fontSize: 12,
      lineHeight: 17,
    },
    serverError: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    serverErrorText: {
      color: isDark ? '#FF6B7D' : '#D2364B',
      fontSize: 12,
      lineHeight: 18,
    },
  });
};
