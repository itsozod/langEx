import * as Haptics from 'expo-haptics';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

import { SymbolView } from './symbol-view';
import { ThemedText } from './themed-text';

type ActionToast = {
  id: number;
  message: string;
  tone: 'neutral' | 'success';
};

type ShowToastOptions = {
  message: string;
  tone?: ActionToast['tone'];
};

type ActionToastContextValue = {
  showToast: (options: ShowToastOptions) => void;
};

const ActionToastContext = createContext<ActionToastContextValue | null>(null);
const DISPLAY_DURATION_MS = 2600;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export function ActionToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ActionToast | null>(null);
  const nextId = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(({ message, tone = 'success' }: ShowToastOptions) => {
    if (timeout.current) clearTimeout(timeout.current);
    nextId.current += 1;
    setToast({ id: nextId.current, message, tone });
    timeout.current = setTimeout(() => setToast(null), DISPLAY_DURATION_MS);

    if (process.env.EXPO_OS === 'ios' && tone === 'success') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ActionToastContext.Provider value={value}>
      {children}
      <ActionToastHost toast={toast} />
    </ActionToastContext.Provider>
  );
}

export function useActionToast() {
  const value = useContext(ActionToastContext);
  if (!value) throw new Error('useActionToast must be used inside ActionToastProvider');
  return value;
}

function ActionToastHost({ toast }: { toast: ActionToast | null }) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const tokens = useUiTokens();
  const entering = reducedMotion
    ? FadeIn.duration(140).reduceMotion(ReduceMotion.System)
    : FadeInDown.duration(190).easing(EASE_OUT).reduceMotion(ReduceMotion.System);
  const exiting = reducedMotion
    ? FadeOut.duration(100).reduceMotion(ReduceMotion.System)
    : FadeOutUp.duration(140).easing(EASE_OUT).reduceMotion(ReduceMotion.System);

  return (
    <View pointerEvents="none" style={[styles.host, { top: insets.top + 10 }]}>
      {toast ? (
        <Animated.View
          key={toast.id}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          entering={entering}
          exiting={exiting}
          style={[
            styles.toast,
            {
              backgroundColor: tokens.card,
              borderColor: tokens.hairline,
            },
          ]}>
          <View
            style={[
              styles.icon,
              { backgroundColor: toast.tone === 'success' ? `${tokens.success}1F` : tokens.fill },
            ]}>
            <SymbolView
              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
              size={17}
              weight="bold"
              tintColor={toast.tone === 'success' ? tokens.success : tokens.text}
            />
          </View>
          <ThemedText numberOfLines={3} style={styles.message}>
            {toast.message}
          </ThemedText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: 520,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 17,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 13,
    paddingVertical: 10,
    boxShadow: '0 6px 24px rgba(0,0,0,0.16)',
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  message: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
});
