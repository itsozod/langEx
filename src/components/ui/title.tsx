import React from 'react';
import { ThemedText, ThemedTextProps } from '../themed-text';

interface TitleProps extends ThemedTextProps {}

const Title = ({ style, ...rest }: TitleProps) => {
  return <ThemedText style={style} type="title" {...rest} />;
};

export default Title;
