import { useAppTheme, type AppTheme } from '@/providers/theme-provider';
import { StyleSheet } from 'react-native';

const createPinnedStyles = (theme: AppTheme) => {
  const isDark = theme === 'dark';
  const border = isDark ? 'rgba(190,176,255,0.14)' : 'rgba(97,76,190,0.11)';

  return StyleSheet.create({
    banner: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: isDark ? '#211C2A' : '#FFFFFF',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: border,
    },
    bannerMain: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 12,
      paddingVertical: 8,
    },
    bannerAccent: {
      width: 3,
      alignSelf: 'stretch',
      borderRadius: 2,
      backgroundColor: '#735FDC',
    },
    bannerCopy: { flex: 1, minWidth: 0, paddingLeft: 10 },
    bannerTitle: {
      color: isDark ? '#C8BEFF' : '#5D4BB3',
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '700',
    },
    bannerPreview: {
      color: isDark ? '#D8D2DE' : '#514B58',
      fontSize: 12,
      lineHeight: 17,
      marginTop: 1,
    },
    bannerButton: {
      width: 52,
      height: 58,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerButtonPressed: {
      backgroundColor: isDark ? 'rgba(190,176,255,0.08)' : 'rgba(97,76,190,0.06)',
    },
    bannerIcon: { color: isDark ? '#C8BEFF' : '#5D4BB3' },
    countBadge: {
      position: 'absolute',
      right: 6,
      top: 7,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      backgroundColor: '#6654C7',
    },
    countText: { color: '#FFFFFF', fontSize: 9, lineHeight: 12, fontWeight: '700' },
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheetBackdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(8, 6, 12, 0.54)',
    },
    sheetBackdropPressable: { flex: 1 },
    sheetSurface: {
      width: '100%',
      maxHeight: '78%',
      overflow: 'hidden',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderCurve: 'continuous',
      backgroundColor: isDark ? '#181420' : '#F8F6FC',
    },
    sheetHandleArea: {
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#211C2A' : '#FFFFFF',
    },
    sheetHandle: {
      width: 38,
      height: 5,
      borderRadius: 3,
      backgroundColor: isDark ? '#675F72' : '#C7C1CD',
    },
    sheetHeader: {
      minHeight: 66,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingLeft: 18,
      paddingRight: 10,
      paddingBottom: 10,
      backgroundColor: isDark ? '#211C2A' : '#FFFFFF',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: border,
    },
    sheetHeaderCopy: { flex: 1, minWidth: 0, gap: 2 },
    sheetTitle: {
      color: isDark ? '#F5F1FA' : '#292432',
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700',
    },
    sheetSubtitle: { color: isDark ? '#9F97AA' : '#756E7D', fontSize: 12, lineHeight: 17 },
    sheetDoneButton: {
      minWidth: 58,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
      borderCurve: 'continuous',
    },
    sheetButtonPressed: {
      backgroundColor: isDark ? 'rgba(190,176,255,0.10)' : 'rgba(97,76,190,0.07)',
    },
    sheetDoneLabel: {
      color: isDark ? '#C8BEFF' : '#5D4BB3',
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '700',
    },
    sheetList: { flex: 1 },
    sheetListContent: { padding: 14, gap: 10 },
    sheetMessage: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      overflow: 'hidden',
      paddingRight: 10,
      borderRadius: 18,
      borderCurve: 'continuous',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      backgroundColor: isDark ? '#302A3D' : '#FFFFFF',
    },
    sheetMessagePressed: {
      backgroundColor: isDark ? '#3A3348' : '#F0ECF8',
    },
    sheetMessageAccent: { width: 4, alignSelf: 'stretch', backgroundColor: '#735FDC' },
    sheetMessageCopy: { flex: 1, minWidth: 0, gap: 4, paddingVertical: 12 },
    sheetMessageMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sheetAuthor: {
      flex: 1,
      color: isDark ? '#C8BEFF' : '#5D4BB3',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
    },
    sheetIndex: {
      color: isDark ? '#91899D' : '#8A8292',
      fontSize: 10,
      lineHeight: 14,
      fontVariant: ['tabular-nums'],
    },
    sheetPreview: {
      color: isDark ? '#D8D2DE' : '#514B58',
      fontSize: 14,
      lineHeight: 20,
    },
    sheetPinBox: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderCurve: 'continuous',
      backgroundColor: isDark ? 'rgba(115,95,220,0.18)' : 'rgba(102,84,199,0.10)',
    },
    sheetPinIcon: { color: isDark ? '#C8BEFF' : '#6654C7' },
    actionsLayer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 20,
      justifyContent: 'flex-end',
    },
    actionsBackdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(8, 6, 12, 0.46)',
    },
    actionsCard: {
      overflow: 'hidden',
      marginHorizontal: 12,
      borderRadius: 22,
      borderCurve: 'continuous',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      backgroundColor: isDark ? '#282234' : '#FFFFFF',
    },
    actionsHeader: { gap: 3, paddingHorizontal: 18, paddingVertical: 14 },
    actionsTitle: {
      color: isDark ? '#F5F1FA' : '#292432',
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
    },
    actionsPreview: {
      color: isDark ? '#9F97AA' : '#756E7D',
      fontSize: 12,
      lineHeight: 17,
    },
    actionsItem: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingHorizontal: 18,
    },
    actionsItemPressed: {
      backgroundColor: isDark ? 'rgba(190,176,255,0.09)' : 'rgba(97,76,190,0.07)',
    },
    actionsItemDisabled: { opacity: 0.45 },
    actionsDivider: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 50,
      backgroundColor: border,
    },
    actionsIcon: { color: isDark ? '#D9D1FF' : '#4B3F8C' },
    actionsLabel: { fontSize: 14, lineHeight: 19, fontWeight: '600' },
    actionsDestructive: { color: isDark ? '#FF9AA4' : '#C0392F' },
  });
};

const styleSheets = new Map<AppTheme, ReturnType<typeof createPinnedStyles>>();

export function useChatPinnedStyles() {
  const { theme } = useAppTheme();
  const cached = styleSheets.get(theme);
  if (cached) return cached;
  const styles = createPinnedStyles(theme);
  styleSheets.set(theme, styles);
  return styles;
}
