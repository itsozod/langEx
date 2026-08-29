import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  Extrapolation,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export function useUserSearchSheet(onClose: () => void) {
  const { height: windowHeight } = useWindowDimensions();
  const [sheetHeight] = useState(() => Math.round(windowHeight * 0.8));
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(reducedMotion ? 0 : sheetHeight);
  const gestureStartY = useSharedValue(0);

  const dismiss = useCallback(() => {
    translateY.set(
      withSpring(
        sheetHeight,
        {
          duration: 300,
          dampingRatio: 1,
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
        duration: 300,
        dampingRatio: 0.8,
        overshootClamping: true,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [translateY]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .onStart(() => {
          gestureStartY.set(translateY.get());
        })
        .onUpdate((event) => {
          const next = gestureStartY.get() + event.translationY;
          translateY.set(next >= 0 ? next : next * 0.18);
        })
        .onEnd((event) => {
          const projected = translateY.get() + event.velocityY * 0.18;
          if (projected > sheetHeight * 0.32) {
            translateY.set(
              withSpring(
                sheetHeight,
                {
                  duration: 300,
                  dampingRatio: 1,
                  velocity: event.velocityY,
                  overshootClamping: true,
                  reduceMotion: ReduceMotion.System,
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
              duration: 300,
              dampingRatio: 0.8,
              velocity: event.velocityY,
              overshootClamping: true,
              reduceMotion: ReduceMotion.System,
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

  return { backdropAnimatedStyle, dismiss, panGesture, sheetAnimatedStyle, sheetHeight };
}
