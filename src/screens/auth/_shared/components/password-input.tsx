import { InputWithIcon } from '@/shared/components/ui/input-with-icon';
import { useTheme } from '@/shared/hooks/use-theme';
import React, { useState } from 'react';

type PasswordInputProps = Omit<
  React.ComponentProps<typeof InputWithIcon>,
  'icon' | 'iconColor' | 'secureTextEntry' | 'trailingIcon' | 'onTrailingIconPress'
>;

const PasswordInput = (props: PasswordInputProps) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputWithIcon
      {...props}
      icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
      iconColor={theme.textSecondary}
      secureTextEntry={!isVisible}
      trailingIcon={{
        ios: isVisible ? 'eye.slash' : 'eye',
        android: isVisible ? 'visibility_off' : 'visibility',
        web: isVisible ? 'visibility_off' : 'visibility',
      }}
      trailingAccessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
      onTrailingIconPress={() => setIsVisible((current) => !current)}
    />
  );
};

export default PasswordInput;
