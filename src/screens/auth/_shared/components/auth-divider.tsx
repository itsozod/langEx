import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function AuthDivider() {
  const styles = useStyles();

  return (
    <View
      style={styles.row}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <View style={styles.line} />
      <ThemedText style={styles.label}>or continue with email</ThemedText>
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
      backgroundColor: isDark ? 'rgba(191, 177, 255, 0.20)' : 'rgba(91, 73, 184, 0.16)',
    },
    label: {
      color: isDark ? '#9F98AD' : '#777181',
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
  });
};
