import { useAppTheme } from '@/providers/theme-provider';
import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export function OnboardingCard({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.card}>{children}</View>;
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    card: {
      width: '100%',
      padding: 20,
      gap: 18,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(31, 25, 47, 0.94)' : 'rgba(255, 255, 255, 0.94)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(151, 134, 219, 0.22)' : 'rgba(91, 70, 176, 0.10)',
      shadowColor: isDark ? '#000000' : '#3B309E',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.2 : 0.07,
      shadowRadius: 24,
      elevation: 3,
    },
  });
};
