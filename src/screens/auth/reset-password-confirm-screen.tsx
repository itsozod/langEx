import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import AuthScreen from './_shared/components/auth-screen';
import ResetPasswordConfirmForm from './_shared/components/reset-password-confirm-form';

const RESET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const ResetPasswordConfirmScreen = () => {
  const { t } = useTranslation('auth');
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = rawToken && RESET_TOKEN_PATTERN.test(rawToken) ? rawToken : null;

  return (
    <AuthScreen
      title={t('resetPasswordConfirm.title')}
      subtitle={t('resetPasswordConfirm.subtitle')}>
      <ResetPasswordConfirmForm token={token} />
    </AuthScreen>
  );
};

export default ResetPasswordConfirmScreen;
