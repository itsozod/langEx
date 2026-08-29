import React from 'react';
import AuthScreen from './_shared/components/auth-screen';
import LoginForm from './_shared/components/login-form';

const LoginScreen = ({ isAddingAccount = false }: { isAddingAccount?: boolean }) => {
  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to continue your language journey."
      dismissible={isAddingAccount}>
      <LoginForm isAddingAccount={isAddingAccount} />
    </AuthScreen>
  );
};

export default LoginScreen;
