import { useTheme } from '@/shared/hooks/use-theme';
import AuthHeader from '@/screens/auth/_shared/components/auth-header';
import { Stack } from 'expo-router';
import React from 'react';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

const AuthLayout = () => {
  const theme = useTheme();
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="welcome" options={{ animation: 'none', headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{ animation: 'slide_from_right', header: (props) => <AuthHeader {...props} /> }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ animation: 'slide_from_right', header: (props) => <AuthHeader {...props} /> }}
      />
      <Stack.Screen
        name="register"
        options={{ animation: 'slide_from_right', header: (props) => <AuthHeader {...props} /> }}
      />
    </Stack>
  );
};

export default AuthLayout;
