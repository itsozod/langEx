import GradientBackground from '@/components/ui/gradient-background';
import SubTitle from '@/components/ui/sub-title';
import Title from '@/components/ui/title';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ResetPasswordForm from './_shared/components/reset-password-form';

const ResetPasswordScreen = () => {
  return (
    <GradientBackground>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
        <Title style={styles.title}>Reset Password</Title>
        <SubTitle style={styles.subTitle}>
          Enter your email and we'll send you a reset {'\n'} link.
        </SubTitle>
        <ResetPasswordForm />
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
    paddingTop: Spacing.five,
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

export default ResetPasswordScreen;
