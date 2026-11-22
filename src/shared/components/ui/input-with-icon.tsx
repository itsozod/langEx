import { useUiTokens } from '@/shared/hooks/use-ui-tokens';
import { SymbolView, type SymbolViewProps } from '@/shared/components/ui/symbol-view';
import { Pressable, StyleSheet } from 'react-native';
import { type ColorTokens, Input, View } from 'tamagui';

type IconName = SymbolViewProps['name'];

type InputWithIconProps = React.ComponentProps<typeof Input> & {
  icon: IconName;
  iconColor: string;
  hasError?: boolean;
  trailingIcon?: IconName;
  trailingAccessibilityLabel?: string;
  onTrailingIconPress?: () => void;
};

export const InputWithIcon = ({
  icon,
  iconColor,
  hasError = false,
  trailingIcon,
  trailingAccessibilityLabel,
  onTrailingIconPress,
  ...inputProps
}: InputWithIconProps) => {
  const tokens = useUiTokens();

  return (
    <View style={styles.inputWrapper}>
      <View style={styles.inputIcon} pointerEvents="none">
        <SymbolView name={icon} size={18} tintColor={iconColor} />
      </View>
      {/* Filled and borderless at rest; the border only appears for focus or an error.
          Tamagui types colors as theme tokens, so the app's plain hex tokens are cast here. */}
      <Input
        height={50}
        pl={44}
        pr={trailingIcon ? 46 : 14}
        rounded={12}
        borderWidth={1}
        borderColor={(hasError ? tokens.danger : 'transparent') as ColorTokens}
        bg={tokens.fill as ColorTokens}
        color={tokens.text as ColorTokens}
        placeholderTextColor={tokens.subtle as ColorTokens}
        fontSize={16}
        focusStyle={{
          borderColor: (hasError ? tokens.danger : tokens.accent) as ColorTokens,
          bg: tokens.fill as ColorTokens,
          outlineWidth: 0,
        }}
        {...inputProps}
      />
      {trailingIcon && onTrailingIconPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={trailingAccessibilityLabel}
          hitSlop={10}
          onPress={onTrailingIconPress}
          style={({ pressed }) => [styles.trailingAction, pressed && styles.pressed]}>
          <SymbolView name={trailingIcon} size={19} tintColor={iconColor} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  trailingAction: {
    position: 'absolute',
    right: 4,
    width: 42,
    height: 48,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.55,
  },
});
