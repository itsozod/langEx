import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

export const SEARCH_ACCENT_COLOR = '#6654C7';

/** Styles shared by every full-screen search: the field, its trigger, the layer and states. */
export const useSearchOverlayStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    field: {
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 17,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(192,177,255,0.18)' : 'rgba(93,72,180,0.13)',
      paddingLeft: 14,
      backgroundColor: isDark ? '#262030' : '#FFFFFF',
    },
    fieldIcon: { color: isDark ? '#BBAEFF' : SEARCH_ACCENT_COLOR },
    input: {
      minWidth: 0,
      flex: 1,
      paddingVertical: 0,
      color: isDark ? '#FFFFFF' : '#201B29',
      fontFamily: 'PlusJakartaSans',
      fontSize: 15,
      lineHeight: 21,
    },
    placeholder: { color: isDark ? '#8F879B' : '#9A92A2' },
    trailingSlot: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
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
      height: 50,
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
    listContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
    sectionLabel: {
      paddingHorizontal: 4,
      paddingBottom: 4,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
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
