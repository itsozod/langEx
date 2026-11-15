import React from 'react';
import AuthScreen from './_shared/components/auth-screen';
import LoginForm from './_shared/components/login-form';
import { useTranslation } from 'react-i18next';

const LoginScreen = ({ isAddingAccount = false }: { isAddingAccount?: boolean }) => {
  const { t } = useTranslation('auth');
  return (
    <AuthScreen
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      dismissible={isAddingAccount}>
      <LoginForm isAddingAccount={isAddingAccount} />
    </AuthScreen>
  );
};

export default LoginScreen;
