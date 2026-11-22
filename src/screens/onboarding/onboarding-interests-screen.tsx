import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { getInterestLabel, InterestIcon } from '@/shared/components/ui/interest-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useOnboardingStore } from '@/shared/store/onboarding-store';

import { OnboardingCard } from './components/onboarding-card';
import { OnboardingScreen } from './components/onboarding-screen';
import { INTERESTS } from './data';
import { useTranslation } from 'react-i18next';

export default function OnboardingInterestsScreen() {
  const styles = useStyles();
  const { t } = useTranslation('onboarding');
  const interests = useOnboardingStore((state) => state.interests);
  const toggleInterest = useOnboardingStore((state) => state.toggleInterest);
  const [error, setError] = useState<string | null>(null);

  const toggle = (interest: string) => {
    toggleInterest(interest);
    const nextCount = interests.includes(interest) ? interests.length - 1 : interests.length + 1;
    if (nextCount >= 3) setError(null);
  };

  const onNext = () => {
    if (interests.length < 3) {
      setError(t('step4.minimum', { count: 3 }));
      return;
    }
    router.push('/onboarding/step5');
  };

  return (
    <OnboardingScreen
      step={4}
      title={t('step4.title')}
      subtitle={t('step4.subtitle')}
      onBack={() => router.back()}>
      <OnboardingCard>
        <View style={styles.selectionHeader}>
          <ThemedText style={styles.label}>{t('step4.selectInterests')}</ThemedText>
          <ThemedText style={[styles.counter, interests.length >= 3 && styles.counterReady]}>
            {t('step4.selected', { count: interests.length })}
          </ThemedText>
        </View>

        <View style={styles.grid}>
          {INTERESTS.map((interest) => {
            const selected = interests.includes(interest);
            return (
              <Pressable
                key={interest}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => toggle(interest)}
                style={({ pressed }) => [
                  styles.pill,
                  selected && styles.pillSelected,
                  pressed && styles.pressed,
                ]}>
                <InterestIcon
                  color={selected ? styles.pillTextSelected.color : styles.pillText.color}
                  interest={interest}
                  size={15}
                />
                <ThemedText style={[styles.pillText, selected && styles.pillTextSelected]}>
                  {getInterestLabel(interest)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        <AuthPrimaryButton label={t('next')} onPress={onNext} />
      </OnboardingCard>
    </OnboardingScreen>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    selectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    label: { color: isDark ? '#F4F2F8' : '#18151F', fontSize: 13, fontWeight: '600' },
    counter: { color: isDark ? '#9A95A6' : '#77727F', fontSize: 12, lineHeight: 17 },
    counterReady: { color: isDark ? '#9ED8B2' : '#247A43', fontWeight: '700' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    pill: {
      minHeight: 43,
      flexDirection: 'row',
      paddingHorizontal: 15,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
    },
    pillSelected: {
      borderColor: 'transparent',
      backgroundColor: isDark ? '#F4F2F8' : '#18151F',
    },
    pillText: {
      color: isDark ? '#F4F2F8' : '#18151F',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    pillTextSelected: { color: isDark ? '#18151F' : '#FFFFFF' },
    pressed: { opacity: 0.7 },
    error: {
      marginTop: -4,
      color: isDark ? '#FF6B7D' : '#D2364B',
      fontSize: 12,
      lineHeight: 17,
    },
  });
};
