import Logo from '@/assets/images/logo.svg';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';

const AppLogo = () => {
  const appTheme = useAppTheme();
  return (
    <Logo
      color={appTheme.theme === 'dark' ? '#E8DEF9' : '#3B309E'}
      style={{
        alignSelf: 'center',
      }}
    />
  );
};

export default AppLogo;
