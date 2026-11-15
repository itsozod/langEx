import React from 'react';
import AuthScreen from './_shared/components/auth-screen';
import RegisterForm from './_shared/components/register-form';
import { useTranslation } from 'react-i18next';

const RegisterScreen = ({ isAddingAccount = false }: { isAddingAccount?: boolean }) => {
  const { t } = useTranslation('auth');
  return (
    <AuthScreen
      title={t('register.title')}
      subtitle={t('register.subtitle')}
      dismissible={isAddingAccount}>
      <RegisterForm isAddingAccount={isAddingAccount} />
    </AuthScreen>
  );
};

export default RegisterScreen;
