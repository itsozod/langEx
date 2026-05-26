import { ThemedText } from '@/components/themed-text';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useAppTheme } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Form, Label, View } from 'tamagui';

const ResetPasswordForm = () => {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.resetForm}>
      <Form style={{ display: 'flex', gap: 20 }}>
        <View>
          <Label style={styles.label}>Email address</Label>
          <InputWithIcon icon="envelope" type="email" iconColor={theme.textSecondary} />
        </View>
        <PrimaryButton
          style={{ height: 52 }}
          iconAfter={
            <SymbolView
              name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
              size={18}
              tintColor="#462A00"
            />
          }>
          <ThemedText type="bold" style={{ color: '#462A00' }}>
            Send reset link
          </ThemedText>
        </PrimaryButton>
      </Form>
    </View>
  );
};

const useStyles = () => {
  const { theme: appTheme } = useAppTheme();
  const theme = useTheme();
  return StyleSheet.create({
    resetForm: {
      width: '100%',
      padding: 25,
      borderRadius: 16,
      backgroundColor: theme.background,
      boxShadow:
        appTheme === 'dark'
          ? '0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(126, 95, 255, 0.25)'
          : '0 12px 32px rgba(82, 63, 184, 0.18), 0 2px 6px rgba(82, 63, 184, 0.10)',
      marginTop: 10,
    },
    label: {
      fontSize: 12,
      color: appTheme === 'dark' ? '#C8C4D5' : '#474553',
      letterSpacing: 0.3,
      fontWeight: '700',
    },
  });
};

export default ResetPasswordForm;
