import React from 'react';
import AuthScreen from './_shared/components/auth-screen';
import ResetPasswordForm from './_shared/components/reset-password-form';

const ResetPasswordScreen = () => {
  return (
    <AuthScreen
      title="Reset your password"
      subtitle="Enter your email and we’ll send you instructions to get back in.">
      <ResetPasswordForm />
    </AuthScreen>
  );
};

export default ResetPasswordScreen;
