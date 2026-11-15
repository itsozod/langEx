import type { Ref } from 'react';
import { ActivityIndicator, Platform, Pressable, TextInput, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';

import { SEARCH_ACCENT_COLOR, useSearchOverlayStyles } from './search-overlay-styles';

type SearchFieldProps = {
  accessibilityLabel: string;
  autoCapitalize?: 'none' | 'words';
  clearLabel: string;
  inputRef?: Ref<TextInput>;
  isPending: boolean;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder: string;
  value: string;
};

/** The editable search bar shown at the top of a full-screen search. */
export function SearchField({
  accessibilityLabel,
  autoCapitalize = 'none',
  clearLabel,
  inputRef,
  isPending,
  onChangeText,
  onClear,
  placeholder,
  value,
}: SearchFieldProps) {
  const styles = useSearchOverlayStyles();

  return (
    <View style={styles.field}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={19}
        weight="medium"
        tintColor={styles.fieldIcon.color}
      />
      <TextInput
        ref={inputRef}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        clearButtonMode="never"
        enterKeyHint="search"
        maxLength={50}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={styles.placeholder.color}
        returnKeyType="search"
        selectionColor={SEARCH_ACCENT_COLOR}
        style={styles.input}
        underlineColorAndroid="transparent"
        value={value}
        {...(Platform.OS === 'android' ? { textAlignVertical: 'center' as const } : null)}
      />
      <View style={styles.trailingSlot}>
        {isPending && value ? (
          <ActivityIndicator size="small" color={styles.fieldIcon.color} />
        ) : value ? (
          <Pressable
            accessibilityLabel={clearLabel}
            accessibilityRole="button"
            hitSlop={6}
            onPress={onClear}
            style={({ pressed }) => [styles.trailingSlot, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
              size={18}
              tintColor={styles.clearIcon.color}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
