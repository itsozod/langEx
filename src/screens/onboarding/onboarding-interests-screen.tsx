import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { getInterestLabel, InterestIcon } from '@/shared/components/ui/interest-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useOnboardingStore } from '@/shared/store/onboardingStore';

import { OnboardingCard } from './components/onboarding-card';
import { OnboardingScreen } from './components/onboarding-screen';
import { INTERESTS } from './data';

export default function OnboardingInterestsScreen() {
  const styles = useStyles();
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
      setError('Choose at least 3 interests to continue.');
      return;
    }
    router.push('/onboarding/step5');
  };

  return (
    <OnboardingScreen
      step={4}
      title="What are you into?"
      subtitle="Pick at least three so we can personalize your community."
      onBack={() => router.back()}>
      <OnboardingCard>
        <View style={styles.selectionHeader}>
          <ThemedText style={styles.label}>Select your interests</ThemedText>
          <ThemedText style={[styles.counter, interests.length >= 3 && styles.counterReady]}>
            {interests.length} selected
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
        <AuthPrimaryButton label="Next" onPress={onNext} />
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
    label: { color: isDark ? '#D8D0E8' : '#34303D', fontSize: 13, fontWeight: '600' },
    counter: { color: isDark ? '#A59BB4' : '#80778C', fontSize: 12, lineHeight: 17 },
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
      borderColor: isDark ? '#4A405F' : '#DED8EC',
      backgroundColor: isDark ? '#171321' : '#FBFAFE',
    },
    pillSelected: {
      borderColor: '#6654C7',
      backgroundColor: isDark ? 'rgba(102,84,199,0.28)' : '#EEEAFB',
    },
    pillText: {
      color: isDark ? '#D8D0E8' : '#4B4555',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    pillTextSelected: { color: isDark ? '#C9BEFF' : '#5643B4' },
    pressed: { opacity: 0.7 },
    error: {
      marginTop: -4,
      color: isDark ? '#FF9A9A' : '#B42318',
      fontSize: 12,
      lineHeight: 17,
    },
  });
};
