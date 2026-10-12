import { useCallback, useEffect, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  Extrapolation,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

type UseChatPinnedSheetOptions = {
  onClose: () => void;
  sheetHeight: number;
};

export function useChatPinnedSheet({ onClose, sheetHeight }: UseChatPinnedSheetOptions) {
  const translateY = useSharedValue(sheetHeight);
  const gestureStartY = useSharedValue(0);

  const close = useCallback(() => {
    translateY.set(
      withSpring(
        sheetHeight,
        {
          dampingRatio: 1,
          duration: 280,
          overshootClamping: true,
          reduceMotion: ReduceMotion.System,
        },
        (finished) => {
          if (finished) scheduleOnRN(onClose);
        },
      ),
    );
  }, [onClose, sheetHeight, translateY]);

  useEffect(() => {
    translateY.set(
      withSpring(0, {
        dampingRatio: 0.86,
        duration: 300,
        overshootClamping: true,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [translateY]);

  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .maxPointers(1)
        .onStart(() => {
          gestureStartY.set(translateY.get());
        })
        .onUpdate((event) => {
          const nextY = gestureStartY.get() + event.translationY;
          translateY.set(nextY >= 0 ? nextY : nextY * 0.14);
        })
        .onEnd((event) => {
          const projectedY = translateY.get() + event.velocityY * 0.18;
          if (projectedY > sheetHeight * 0.24) {
            translateY.set(
              withSpring(
                sheetHeight,
                {
                  dampingRatio: 1,
                  duration: 280,
                  overshootClamping: true,
                  reduceMotion: ReduceMotion.System,
                  velocity: event.velocityY,
                },
                (finished) => {
                  if (finished) scheduleOnRN(onClose);
                },
              ),
            );
            return;
          }

          translateY.set(
            withSpring(0, {
              dampingRatio: 0.86,
              duration: 280,
              reduceMotion: ReduceMotion.System,
              velocity: event.velocityY,
            }),
          );
        }),
    [gestureStartY, onClose, sheetHeight, translateY],
  );

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.get(), [0, sheetHeight], [1, 0], Extrapolation.CLAMP),
  }));

  return { backdropAnimatedStyle, close, dragGesture, sheetAnimatedStyle };
}
