import { SymbolView as ExpoSymbolView, type SymbolViewProps } from 'expo-symbols';
import { Platform, StyleSheet } from 'react-native';

export type { SymbolViewProps } from 'expo-symbols';

/**
 * Keeps Material Symbols optically centered on Android.
 *
 * expo-symbols renders Android icons through a font. The font's baseline sits
 * slightly above the middle of its square view on some physical devices, even
 * when the parent uses alignItems/justifyContent. iOS SF Symbols do not need
 * this correction.
 */
export function SymbolView({ style, ...props }: SymbolViewProps) {
  return (
    <ExpoSymbolView
      {...props}
      style={[styles.symbol, Platform.OS === 'android' && styles.androidSymbol, style]}
    />
  );
}

const styles = StyleSheet.create({
  symbol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidSymbol: {
    transform: [{ translateY: 2 }],
  },
});
