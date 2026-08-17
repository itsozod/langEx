import React from 'react';
import AuthScreen from './_shared/components/auth-screen';
import LoginForm from './_shared/components/login-form';

const LoginScreen = () => {
  return (
    <AuthScreen title="Welcome back" subtitle="Sign in to continue your language journey.">
      <LoginForm />
    </AuthScreen>
  );
};

export default LoginScreen;
