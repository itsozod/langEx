import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';
import { translateMessage } from '@/shared/i18n/translate-message';

type AuthFormFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

const AuthFormField = ({ label, error, children }: AuthFormFieldProps) => {
  const tokens = useUiTokens();
  const { t } = useTranslation();

  return (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: tokens.text }]}>{label}</ThemedText>
      {children}
      {error ? (
        <ThemedText style={[styles.error, { color: tokens.danger }]}>
          {translateMessage(t, error)}
        </ThemedText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontFamily: FONT.semibold, fontSize: 14, lineHeight: 19 },
  error: { fontSize: 13, lineHeight: 18 },
});

export default AuthFormField;
