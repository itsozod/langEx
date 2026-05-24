import AuthHeader from '@/components/auth-header';
import { Stack } from 'expo-router';
import React from 'react';

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ animation: 'none', headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{ animation: 'slide_from_right', header: (props) => <AuthHeader {...props} /> }}
      />
    </Stack>
  );
};

export default AuthLayout;
