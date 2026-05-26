import AuthHeader from '@/components/auth-header';
import { useTheme } from '@/hooks/use-theme';
import { Stack } from 'expo-router';
import React from 'react';

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
