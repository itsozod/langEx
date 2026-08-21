import { useCallback, useState } from 'react';
import {
  Platform,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
} from 'react-native';

const MIN_COMPOSER_HEIGHT = 46;
const MAX_COMPOSER_HEIGHT = 110;
const COMPOSER_LINE_HEIGHT = 20;
const COMPOSER_VERTICAL_PADDING = 26;
const MAX_CHAT_WIDTH = 720;
const COMPOSER_HORIZONTAL_CHROME = 90;
const APPROXIMATE_CHARACTER_WIDTH = 7.4;

const clampHeight = (height: number) =>
  Math.min(MAX_COMPOSER_HEIGHT, Math.max(MIN_COMPOSER_HEIGHT, height));

function normalizeMeasuredHeight(measuredHeight: number) {
  if (Platform.OS !== 'android') return clampHeight(Math.ceil(measuredHeight));

  // Android can report one-pixel content-size changes while the text is still on the same line.
  // Snapping to our known typography prevents those measurements from relaying out the entire
  // Gifted Chat toolbar on every keystroke.
  const measuredLineCount = Math.max(
    1,
    Math.round((measuredHeight - COMPOSER_VERTICAL_PADDING) / COMPOSER_LINE_HEIGHT),
  );

  return clampHeight(COMPOSER_VERTICAL_PADDING + measuredLineCount * COMPOSER_LINE_HEIGHT);
}

function estimateLineCount(text: string, availableWidth: number) {
  const charactersPerLine = Math.max(1, Math.floor(availableWidth / APPROXIMATE_CHARACTER_WIDTH));

  return text.split('\n').reduce((total, line) => {
    const characterCount = Array.from(line).length;
    return total + Math.max(1, Math.ceil(characterCount / charactersPerLine));
  }, 0);
}

export function useChatComposerHeight() {
  const { width: windowWidth } = useWindowDimensions();
  const [composerHeight, setComposerHeight] = useState(MIN_COMPOSER_HEIGHT);

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const nextHeight = normalizeMeasuredHeight(event.nativeEvent.contentSize.height);
      setComposerHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight,
      );
    },
    [],
  );

  const resetComposerHeight = useCallback(() => {
    setComposerHeight(MIN_COMPOSER_HEIGHT);
  }, []);

  const prepareComposerHeight = useCallback(
    (text: string) => {
      const availableWidth = Math.max(
        1,
        Math.min(windowWidth, MAX_CHAT_WIDTH) - COMPOSER_HORIZONTAL_CHROME,
      );
      const lineCount = estimateLineCount(text, availableWidth);
      setComposerHeight(clampHeight(COMPOSER_VERTICAL_PADDING + lineCount * COMPOSER_LINE_HEIGHT));
    },
    [windowWidth],
  );

  return {
    composerHeight,
    handleContentSizeChange,
    isComposerScrollable: composerHeight >= MAX_COMPOSER_HEIGHT,
    prepareComposerHeight,
    resetComposerHeight,
  };
}
