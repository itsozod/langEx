import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export function AuthDivider() {
  const styles = useStyles();
  const { t } = useTranslation('auth');

  return (
    <View
      style={styles.row}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <View style={styles.line} />
      <ThemedText style={styles.label}>{t('divider')}</ThemedText>
      <View style={styles.line} />
    </View>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    line: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(24,21,31,0.10)',
    },
    label: {
      color: isDark ? '#9A95A6' : '#77727F',
      fontSize: 13,
      lineHeight: 18,
    },
  });
};
