import React from 'react';
import AuthScreen from './_shared/components/auth-screen';
import RegisterForm from './_shared/components/register-form';

const RegisterScreen = () => {
  return (
    <AuthScreen
      title="Create your account"
      subtitle="Meet language partners and start practicing together.">
      <RegisterForm />
    </AuthScreen>
  );
};

export default RegisterScreen;
