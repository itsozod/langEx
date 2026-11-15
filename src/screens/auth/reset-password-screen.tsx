import React from 'react';
import AuthScreen from './_shared/components/auth-screen';
import ResetPasswordForm from './_shared/components/reset-password-form';
import { useTranslation } from 'react-i18next';

const ResetPasswordScreen = ({ isAddingAccount = false }: { isAddingAccount?: boolean }) => {
  const { t } = useTranslation('auth');
  return (
    <AuthScreen
      title={t('resetPassword.title')}
      subtitle={t('resetPassword.subtitle')}
      dismissible={isAddingAccount}>
      <ResetPasswordForm isAddingAccount={isAddingAccount} />
    </AuthScreen>
  );
};

export default ResetPasswordScreen;
