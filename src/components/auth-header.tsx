import AppLogo from '@/components/ui/app-logo';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AuthHeader = ({ back }: NativeStackHeaderProps) => {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background }}>
      <View style={styles.row}>
        {back ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.side, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              size={22}
              weight="semibold"
              tintColor={theme.text}
            />
          </Pressable>
        ) : (
          <View style={styles.side} />
        )}
        <AppLogo />
        <View style={styles.side} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  side: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});

export default AuthHeader;
