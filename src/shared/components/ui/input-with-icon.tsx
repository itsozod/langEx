import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { useAppTheme } from '@/providers/theme-provider';
import { Pressable, StyleSheet } from 'react-native';
import { Input, View } from 'tamagui';

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
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <View style={styles.inputWrapper}>
      <View style={styles.inputIcon} pointerEvents="none">
        <SymbolView name={icon} size={18} tintColor={iconColor} />
      </View>
      <Input
        height={54}
        pl={44}
        pr={trailingIcon ? 46 : 16}
        rounded={14}
        borderWidth={1}
        borderColor={hasError ? '#D64545' : isDark ? '#4A405F' : '#DED8EC'}
        bg={isDark ? '#171321' : '#FBFAFE'}
        color={isDark ? '#F5F1FF' : '#221E2B'}
        placeholderTextColor="$gray9"
        fontSize={15}
        focusStyle={{
          borderColor: hasError ? '#D64545' : '#6654C7',
          bg: isDark ? '#1B1627' : '#FFFFFF',
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
