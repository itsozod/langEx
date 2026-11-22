import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

type RegistrationCodeInputProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  hasError?: boolean;
  onChangeText: (code: string) => void;
  value: string;
};

const CODE_LENGTH = 6;
const CODE_SLOTS = Array.from({ length: CODE_LENGTH }, (_, index) => index);

const RegistrationCodeInput = forwardRef<TextInput, RegistrationCodeInputProps>(
  ({ accessibilityLabel, disabled = false, hasError = false, onChangeText, value }, ref) => {
    const tokens = useUiTokens();
    const [isFocused, setIsFocused] = useState(false);
    const activeIndex = Math.min(value.length, CODE_LENGTH - 1);

    return (
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.slots}>
          {CODE_SLOTS.map((index) => {
            const isActive = isFocused && !disabled && index === activeIndex;
            return (
              <View
                key={index}
                style={[
                  styles.slot,
                  { backgroundColor: tokens.fill, borderColor: tokens.hairline },
                  isActive && { borderColor: tokens.accent, borderWidth: 2 },
                  hasError && { borderColor: tokens.danger },
                ]}>
                <ThemedText style={[styles.digit, { color: tokens.text }]}>
                  {value[index] ?? ''}
                </ThemedText>
              </View>
            );
          })}
        </View>

        <TextInput
          ref={ref}
          accessibilityLabel={accessibilityLabel}
          autoComplete={process.env.EXPO_OS === 'android' ? 'sms-otp' : 'one-time-code'}
          autoFocus
          caretHidden
          contextMenuHidden
          editable={!disabled}
          importantForAutofill="yes"
          inputMode="numeric"
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          onBlur={() => setIsFocused(false)}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          onFocus={() => setIsFocused(true)}
          selectionColor="transparent"
          style={styles.nativeInput}
          textContentType="oneTimeCode"
          value={value}
        />
      </View>
    );
  },
);

RegistrationCodeInput.displayName = 'RegistrationCodeInput';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  slots: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  slot: {
    flex: 1,
    maxWidth: 54,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  digit: {
    fontFamily: FONT.bold,
    fontSize: 22,
    lineHeight: 28,
    fontVariant: ['tabular-nums'],
  },
  nativeInput: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    opacity: 0.01,
    color: 'transparent',
  },
});

export default RegistrationCodeInput;
