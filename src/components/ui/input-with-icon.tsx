import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { StyleSheet } from 'react-native';
import { Input, View } from 'tamagui';

type IconName = SymbolViewProps['name'];

type InputWithIconProps = React.ComponentProps<typeof Input> & {
  icon: IconName;
  iconColor: string;
};

export const InputWithIcon = ({ icon, iconColor, ...inputProps }: InputWithIconProps) => {
  return (
    <View style={styles.inputWrapper}>
      <View style={styles.inputIcon} pointerEvents="none">
        <SymbolView name={icon} size={18} tintColor={iconColor} />
      </View>
      <Input pr={38} {...inputProps} />
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
    right: 12,
    zIndex: 1,
  },
});
