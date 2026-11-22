import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

export const SEARCH_ACCENT_COLOR = '#7B68E0';
export const SEARCH_FIELD_HEIGHT = 42;

/** Styles shared by every full-screen search: the field, its trigger, the layer and states. */
export const useSearchOverlayStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    // Filled and borderless, like the native search field: it reads as an input, not a card.
    field: {
      height: SEARCH_FIELD_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 12,
      borderCurve: 'continuous',
      paddingLeft: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
    },
    fieldIcon: { color: isDark ? '#9A95A6' : '#77727F' },
    input: {
      minWidth: 0,
      flex: 1,
      paddingVertical: 0,
      color: isDark ? '#FFFFFF' : '#201B29',
      fontFamily: 'PlusJakartaSans',
      fontSize: 16,
      lineHeight: 21,
    },
    placeholder: { color: isDark ? '#8C8798' : '#8A8592' },
    trailingSlot: {
      width: 40,
      height: SEARCH_FIELD_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearIcon: { color: isDark ? '#A8A0B3' : '#7C7487' },
    hidden: { opacity: 0 },
    pressed: { opacity: 0.75 },
    // Above the tab bar (iOS native and Android JS tabs) without hiding it.
    root: { ...StyleSheet.absoluteFill, zIndex: 100, elevation: 100 },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: isDark ? '#100D17' : '#F8F6FC',
    },
    bar: { position: 'absolute' },
    cancelSlot: {
      position: 'absolute',
      height: SEARCH_FIELD_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 16,
    },
    cancelButton: { minHeight: 44, minWidth: 64, alignItems: 'center', justifyContent: 'center' },
    cancelText: {
      color: isDark ? '#C9BEFF' : SEARCH_ACCENT_COLOR,
      fontSize: 15,
      fontWeight: '600',
    },
    content: { ...StyleSheet.absoluteFill },
    keyboardView: { flex: 1 },
    listContent: { flexGrow: 1, paddingBottom: 24 },
    sectionLabel: {
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 6,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700',
      color: isDark ? '#948BA3' : '#7C7487',
    },
    state: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 10 },
    stateIcon: {
      width: 60,
      height: 60,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#2A2338' : '#EEEAFB',
    },
    stateIconColor: { color: isDark ? '#C9BEFF' : SEARCH_ACCENT_COLOR },
    stateTitle: { fontSize: 17, lineHeight: 23, textAlign: 'center' },
    stateMessage: { maxWidth: 300, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  });
};
