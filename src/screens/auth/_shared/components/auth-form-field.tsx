import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type AuthFormFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

const AuthFormField = ({ label, error, children }: AuthFormFieldProps) => {
  const styles = useStyles();

  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {children}
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
};

const useStyles = () => {
  const { theme } = useAppTheme();

  return StyleSheet.create({
    field: {
      gap: 7,
    },
    label: {
      color: theme === 'dark' ? '#D8D0E8' : '#34303D',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    error: {
      color: theme === 'dark' ? '#FF9A9A' : '#B42318',
      fontSize: 12,
      lineHeight: 17,
    },
  });
};

export default AuthFormField;
