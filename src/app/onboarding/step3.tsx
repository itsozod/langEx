import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { LanguagePicker } from '@/screens/onboarding/components/language-picker';
import { OnboardingCard } from '@/screens/onboarding/components/onboarding-card';
import { OnboardingScreen } from '@/screens/onboarding/components/onboarding-screen';
import { languagesSchema, type LanguagesFormValues } from '@/screens/onboarding/schemas';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { type ProficiencyLevel, useOnboardingStore } from '@/shared/store/onboardingStore';

const LEVELS: { label: string; value: ProficiencyLevel }[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

export default function OnboardingStepThree() {
  const styles = useStyles();
  const update = useOnboardingStore((state) => state.update);
  const nativeLanguage = useOnboardingStore((state) => state.nativeLanguage);
  const learningLanguage = useOnboardingStore((state) => state.learningLanguage);
  const proficiencyLevel = useOnboardingStore((state) => state.proficiencyLevel);
  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<LanguagesFormValues>({
    resolver: zodResolver(languagesSchema),
    defaultValues: { nativeLanguage, learningLanguage, proficiencyLevel },
  });
  const selectedNativeLanguage = useWatch({ control, name: 'nativeLanguage' });
  const selectedLearningLanguage = useWatch({ control, name: 'learningLanguage' });

  const save = (values: LanguagesFormValues) => update(values);
  const onBack = () => {
    save(getValues());
    router.back();
  };
  const onNext = (values: LanguagesFormValues) => {
    save(values);
    router.push('/onboarding/step4');
  };

  return (
    <OnboardingScreen
      step={3}
      title="Choose your languages"
      subtitle="Tell us what you speak and what you want to practice."
      onBack={onBack}>
      <OnboardingCard>
        <Controller
          control={control}
          name="nativeLanguage"
          render={({ field: { onChange, value } }) => (
            <LanguagePicker
              label="Native language"
              placeholder="Select your native language"
              value={value}
              excludedValue={selectedLearningLanguage}
              error={errors.nativeLanguage?.message}
              onChange={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="learningLanguage"
          render={({ field: { onChange, value } }) => (
            <LanguagePicker
              label="Learning language"
              placeholder="Select a language to learn"
              value={value}
              excludedValue={selectedNativeLanguage}
              error={errors.learningLanguage?.message}
              onChange={onChange}
            />
          )}
        />

        <View style={styles.levelField}>
          <ThemedText style={styles.label}>Your current level</ThemedText>
          <Controller
            control={control}
            name="proficiencyLevel"
            render={({ field: { onChange, value } }) => (
              <View style={styles.levelRow}>
                {LEVELS.map((level) => {
                  const selected = level.value === value;
                  return (
                    <Pressable
                      key={level.value}
                      onPress={() => onChange(level.value)}
                      style={({ pressed }) => [
                        styles.levelPill,
                        selected && styles.levelPillSelected,
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText style={[styles.levelText, selected && styles.levelTextSelected]}>
                        {level.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
        </View>

        <AuthPrimaryButton label="Next" onPress={() => void handleSubmit(onNext)()} />
      </OnboardingCard>
    </OnboardingScreen>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    levelField: {
      gap: 8,
    },
    label: {
      color: isDark ? '#D8D0E8' : '#34303D',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    levelRow: {
      flexDirection: 'row',
      gap: 8,
    },
    levelPill: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 7,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? '#4A405F' : '#DED8EC',
      backgroundColor: isDark ? '#171321' : '#FBFAFE',
    },
    levelPillSelected: {
      borderColor: '#6654C7',
      backgroundColor: isDark ? 'rgba(102,84,199,0.28)' : '#EEEAFB',
    },
    levelText: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
    },
    levelTextSelected: {
      color: isDark ? '#C9BEFF' : '#5643B4',
    },
    pressed: {
      opacity: 0.7,
    },
  });
};
