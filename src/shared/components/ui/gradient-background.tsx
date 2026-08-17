import { useTheme } from '@/shared/hooks/use-theme';
import { LinearGradient } from '@tamagui/linear-gradient';
import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

const GradientBackground = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <LinearGradient
      style={styles.container}
      colors={[theme.heroGradientStart, theme.heroGradientEnd]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default GradientBackground;
