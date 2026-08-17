import { forwardRef } from 'react';
import { Button, type ButtonProps, styled, type TamaguiElement } from 'tamagui';

const PrimaryButtonFrame = styled(Button, {
  name: 'PrimaryButton',
  bg: '$primaryOrange',
  borderWidth: 0,
  rounded: 12,
  pressStyle: {
    bg: '$primaryOrangePressed',
  },
  hoverStyle: {
    bg: '$primaryOrangeHover',
  },
  focusStyle: {
    bg: '$primaryOrangePressed',
  },
});

export const PrimaryButton = forwardRef<TamaguiElement, ButtonProps>((props, ref) => (
  <Button.Apply>
    <PrimaryButtonFrame ref={ref} {...props} />
  </Button.Apply>
));

PrimaryButton.displayName = 'PrimaryButton';
