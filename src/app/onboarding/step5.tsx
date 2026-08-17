import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { OnboardingCard } from '@/screens/onboarding/components/onboarding-card';
import { OnboardingScreen } from '@/screens/onboarding/components/onboarding-screen';
import { useCompleteProfileMutation } from '@/screens/onboarding/hooks';
import { bioSchema, type BioFormValues } from '@/screens/onboarding/schemas';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { useOnboardingStore } from '@/shared/store/onboardingStore';

export default function OnboardingStepFive() {
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
        message: error instanceof Error ? error.message : 'Unable to finish your profile.',
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
      title="Introduce yourself"
      subtitle="A short bio makes it easier to find the right language partners."
      onBack={onBack}
      headerAction={
        <Pressable
          hitSlop={10}
          disabled={profileMutation.isPending}
          onPress={skip}
          style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
          <ThemedText style={styles.skipText}>Skip</ThemedText>
        </Pressable>
      }>
      <OnboardingCard>
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.label}>Bio</ThemedText>
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
                placeholder="Share what you enjoy, why you're learning, or what you'd love to talk about…"
                placeholderTextColor={styles.placeholder.color}
                textAlignVertical="top"
                style={[styles.textArea, errors.bio && styles.textAreaError]}
              />
            )}
          />
          {errors.bio?.message ? (
            <ThemedText style={styles.error}>{errors.bio.message}</ThemedText>
          ) : null}
        </View>

        {errors.root?.server?.message ? (
          <View style={styles.serverError}>
            <ThemedText style={styles.serverErrorText}>{errors.root.server.message}</ThemedText>
          </View>
        ) : null}

        <AuthPrimaryButton
          label={profileMutation.isPending ? 'Finishing…' : 'Finish'}
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
      color: isDark ? '#BFB1FF' : '#5B49B8',
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
      color: isDark ? '#D8D0E8' : '#34303D',
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
      borderColor: isDark ? '#4A405F' : '#DED8EC',
      backgroundColor: isDark ? '#171321' : '#FBFAFE',
      color: isDark ? '#F5F1FF' : '#221E2B',
      fontFamily: 'PlusJakartaSans',
      fontSize: 15,
      lineHeight: 22,
    },
    textAreaError: {
      borderColor: '#D64545',
    },
    placeholder: {
      color: isDark ? '#8E849D' : '#91899E',
    },
    error: {
      color: isDark ? '#FF9A9A' : '#B42318',
      fontSize: 12,
      lineHeight: 17,
    },
    serverError: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255,112,112,0.10)' : '#FFF1F0',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,140,140,0.22)' : '#FFD0CC',
    },
    serverErrorText: {
      color: isDark ? '#FFAAAA' : '#9F2018',
      fontSize: 12,
      lineHeight: 18,
    },
  });
};
