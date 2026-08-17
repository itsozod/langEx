import AppLogo from '@/shared/components/ui/app-logo';
import { useAppTheme } from '@/providers/theme-provider';
import { useTheme } from '@/shared/hooks/use-theme';
import { router, type NativeStackHeaderProps } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AuthHeader = ({ back }: NativeStackHeaderProps) => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
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
          <View style={styles.sidePlaceholder} />
        )}
        <AppLogo />
        <View style={styles.sidePlaceholder} />
      </View>
    </SafeAreaView>
  );
};

const useStyles = () => {
  const { theme } = useAppTheme();

  return StyleSheet.create({
    safeArea: {
      backgroundColor: theme === 'dark' ? '#2B2440' : '#F2EFFF',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    side: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)',
    },
    sidePlaceholder: {
      width: 40,
      height: 40,
    },
    pressed: {
      opacity: 0.6,
    },
  });
};

export default AuthHeader;
