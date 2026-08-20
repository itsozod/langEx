import { useCallback, useState } from 'react';
import {
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
      const measuredHeight = Math.ceil(event.nativeEvent.contentSize.height);
      setComposerHeight(clampHeight(measuredHeight));
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
    prepareComposerHeight,
    resetComposerHeight,
  };
}
