import GradientBackground from '@/components/ui/gradient-background';
import SubTitle from '@/components/ui/sub-title';
import Title from '@/components/ui/title';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginForm from './_shared/components/login-form';

const LoginScreen = () => {
  const appTheme = useAppTheme();
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <Title style={styles.title}>Welcome Back.</Title>
        <SubTitle style={styles.subTitle}>
          Continue your premium language {'\n'} exchange journey with elite partners.
        </SubTitle>
        <LoginForm />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    fontSize: 32,
    lineHeight: 30,
  },
  subTitle: {
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
  },
});

export default LoginScreen;
