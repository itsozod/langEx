import { useMemo } from 'react';
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

const DISMISS_DISTANCE_RATIO = 0.25;

type UseChatImageDismissOptions = {
  height: number;
  isEnabled: boolean;
  onClose: () => void;
};

function projectVelocity(velocity: number, decelerationRate = 0.998) {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export function useChatImageDismiss({ height, isEnabled, onClose }: UseChatImageDismissOptions) {
  const translateY = useSharedValue(0);
  const gestureStartY = useSharedValue(0);

  const dismissGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isEnabled)
        .activeOffsetY([-12, 12])
        .failOffsetX([-24, 24])
        .maxPointers(1)
        .onStart(() => {
          gestureStartY.set(translateY.get());
        })
        .onUpdate((event) => {
          const nextY = gestureStartY.get() + event.translationY;
          translateY.set(nextY >= 0 ? nextY : nextY * 0.15);
        })
        .onEnd((event) => {
          const projectedY = translateY.get() + projectVelocity(event.velocityY);
          if (projectedY > height * DISMISS_DISTANCE_RATIO) {
            translateY.set(
              withSpring(
                height,
                {
                  dampingRatio: 1,
                  duration: 300,
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
              dampingRatio: 0.8,
              duration: 300,
              reduceMotion: ReduceMotion.System,
              velocity: event.velocityY,
            }),
          );
        })
        .onFinalize((_, succeeded) => {
          if (!succeeded) {
            translateY.set(
              withSpring(0, {
                dampingRatio: 1,
                duration: 300,
                reduceMotion: ReduceMotion.System,
              }),
            );
          }
        }),
    [gestureStartY, height, isEnabled, onClose, translateY],
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.get(), [0, height], [1, 0], Extrapolation.CLAMP),
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.get() },
      {
        scale: interpolate(translateY.get(), [0, height], [1, 0.9], Extrapolation.CLAMP),
      },
    ],
  }));

  return { backdropStyle, contentStyle, dismissGesture };
}
