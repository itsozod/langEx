import { useAppTheme } from '@/providers/theme-provider';
import React from 'react';
import { ThemedText, ThemedTextProps } from './themed-text';

interface SubTitleProps extends ThemedTextProps {}

const SubTitle = ({ style, ...rest }: SubTitleProps) => {
  const appTheme = useAppTheme();
  return (
    <ThemedText
      type="subtitle"
      style={[style, { color: appTheme.theme === 'dark' ? '#C8C4D5' : '#474553' }]}
      {...rest}
    />
  );
};

export default SubTitle;
