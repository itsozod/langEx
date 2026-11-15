import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Bottom padding the composer keeps above the screen edge (safe area, at least this much). */
export const COMPOSER_MIN_BOTTOM_PADDING = 8;

/**
 * How much of the keyboard height is already absorbed by the composer's bottom safe-area padding.
 * The sticky composer and the chat scroll view both use it, so the input and the messages lift by
 * exactly the same distance and the composer sits `COMPOSER_MIN_BOTTOM_PADDING` above the keyboard.
 */
export function useComposerKeyboardOffset() {
  const { bottom } = useSafeAreaInsets();
  return Math.max(bottom, COMPOSER_MIN_BOTTOM_PADDING) - COMPOSER_MIN_BOTTOM_PADDING;
}
