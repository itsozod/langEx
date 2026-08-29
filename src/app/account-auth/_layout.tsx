import { Stack } from 'expo-router';

import { useTheme } from '@/shared/hooks/use-theme';

export const unstable_settings = { initialRouteName: 'login' };

export default function AccountAuthLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
