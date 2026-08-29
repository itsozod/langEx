import React from 'react';
import AuthScreen from './_shared/components/auth-screen';
import RegisterForm from './_shared/components/register-form';

const RegisterScreen = ({ isAddingAccount = false }: { isAddingAccount?: boolean }) => {
  return (
    <AuthScreen
      title="Create your account"
      subtitle="Meet language partners and start practicing together."
      dismissible={isAddingAccount}>
      <RegisterForm isAddingAccount={isAddingAccount} />
    </AuthScreen>
  );
};

export default RegisterScreen;
