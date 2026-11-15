import { useFocusEffect } from 'expo-router';
import { type ReactElement, useCallback, useRef } from 'react';
import {
  BackHandler,
  FlatList,
  Keyboard,
  type ListRenderItem,
  Platform,
  Pressable,
  type TextInput,
  View,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { KeyboardAvoidingView, KeyboardController } from 'react-native-keyboard-controller';
import Animated from 'react-native-reanimated';

import { ThemedText } from '@/shared/components/ui/themed-text';
import {
  type SearchBarRect,
  useSearchOverlayTransition,
} from '@/shared/hooks/use-search-overlay-transition';

import { SearchField } from './search-field';
import { useSearchOverlayStyles } from './search-overlay-styles';

type SearchOverlayProps<T> = {
  /** Where the page's search trigger was on screen; the bar rises from here. */
  origin: SearchBarRect | null;
  /** Called once the closing animation (Cancel, Android back, or iOS swipe) has finished. */
  onClosed: () => void;
  // Search field
  accessibilityLabel: string;
  autoCapitalize?: 'none' | 'words';
  clearLabel: string;
  isPending: boolean;
  onChangeText: (text: string) => void;
  placeholder: string;
  value: string;
  // Cancel action
  cancelLabel: string;
  closeLabel: string;
  // Results
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  ListEmptyComponent: ReactElement;
  sectionLabel?: string;
};

/**
 * Full-screen search layer rendered above the tab navigator. It covers the tab bar without hiding
 * it, and stays mounted underneath any screen pushed from a result, so going back shows it again.
 */
export function SearchOverlay<T>({
  origin,
  onClosed,
  accessibilityLabel,
  autoCapitalize,
  clearLabel,
  isPending,
  onChangeText,
  placeholder,
  value,
  cancelLabel,
  closeLabel,
  data,
  keyExtractor,
  renderItem,
  ListEmptyComponent,
  sectionLabel,
}: SearchOverlayProps<T>) {
  const styles = useSearchOverlayStyles();
  const inputRef = useRef<TextInput>(null);
  const focusInput = useCallback(() => inputRef.current?.focus(), []);
  const transition = useSearchOverlayTransition(origin, onClosed, focusInput);

  const { close: closeTransition } = transition;
  const close = useCallback(() => {
    Keyboard.dismiss();
    closeTransition();
  }, [closeTransition]);

  // Android back plays the same closing animation as Cancel.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        close();
        return true;
      });
      return () => subscription.remove();
    }, [close]),
  );

  return (
    <View accessibilityViewIsModal style={styles.root}>
      <Animated.View pointerEvents="none" style={[styles.backdrop, transition.backdropStyle]} />

      <GestureDetector gesture={transition.swipeGesture}>
        <Animated.View
          style={[styles.content, { top: transition.contentTop }, transition.contentStyle]}>
          <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
            <FlatList
              contentContainerStyle={styles.listContent}
              data={data}
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="always"
              keyExtractor={keyExtractor}
              ListEmptyComponent={ListEmptyComponent}
              ListHeaderComponent={
                sectionLabel && data.length ? (
                  <ThemedText style={styles.sectionLabel}>{sectionLabel}</ThemedText>
                ) : null
              }
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
          </KeyboardAvoidingView>
        </Animated.View>
      </GestureDetector>

      <Animated.View
        style={[
          styles.bar,
          { top: transition.barTop, left: transition.barLeft },
          transition.barStyle,
        ]}>
        <SearchField
          accessibilityLabel={accessibilityLabel}
          autoCapitalize={autoCapitalize}
          clearLabel={clearLabel}
          inputRef={inputRef}
          isPending={isPending}
          onChangeText={onChangeText}
          onClear={() => {
            onChangeText('');
            inputRef.current?.focus();
          }}
          placeholder={placeholder}
          value={value}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.cancelSlot,
          {
            top: transition.barTop,
            left: transition.cancelLeft,
            width: transition.cancelWidth,
          },
          transition.cancelStyle,
        ]}>
        <Pressable
          accessibilityLabel={closeLabel}
          accessibilityRole="button"
          hitSlop={6}
          onPress={close}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
          <ThemedText numberOfLines={1} style={styles.cancelText}>
            {cancelLabel}
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

let isLeaving = false;

/**
 * Opens a result only after the search keyboard has fully closed. The chat screen's keyboard
 * avoidance reads the keyboard state when it mounts; pushing it while the search keyboard is still
 * animating away leaves the composer offset wrong, so the next keyboard covers the input.
 * Resolves immediately when the keyboard is already closed; repeated taps are ignored meanwhile.
 */
export function leaveSearch(navigate: () => void) {
  if (isLeaving) return;
  isLeaving = true;
  void KeyboardController.dismiss()
    .then(navigate)
    .finally(() => {
      isLeaving = false;
    });
}
