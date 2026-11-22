import { useAppTheme, type AppTheme } from '@/providers/theme-provider';
import { StyleSheet } from 'react-native';

const createChatStyles = (theme: AppTheme) => {
  const isDark = theme === 'dark';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,21,31,0.08)';

  return StyleSheet.create({
    safeArea: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
    pressed: { opacity: 0.65 },
    threadViewport: { flex: 1, overflow: 'hidden' },
    chat: { flex: 1, backgroundColor: isDark ? '#121117' : '#F6F5F9' },
    messagesContainer: { flex: 1, backgroundColor: isDark ? '#121117' : '#F6F5F9' },
    messageList: { flexGrow: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10 },
    messageLane: { width: '100%' },
    messageRowGrouped: { marginBottom: 3 },
    messageRowSeparated: { marginBottom: 10 },
    messageSwipeable: { maxWidth: '78%', overflow: 'visible' },
    messageSwipeableLeft: { alignSelf: 'flex-start', marginLeft: 2 },
    messageSwipeableRight: { alignSelf: 'flex-end', marginRight: 2 },
    bubble: {
      minWidth: 74,
      maxWidth: '100%',
      borderRadius: 20,
      paddingTop: 10,
      paddingHorizontal: 13,
      paddingBottom: 7,
    },
    bubbleLeft: {
      backgroundColor: isDark ? '#26242E' : '#FFFFFF',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
    },
    bubbleRight: {
      backgroundColor: isDark ? '#7B68E0' : '#6B57D6',
    },
    bubbleJoinAboveLeft: { borderTopLeftRadius: 7 },
    bubbleJoinBelowLeft: { borderBottomLeftRadius: 7 },
    bubbleJoinAboveRight: { borderTopRightRadius: 7 },
    bubbleJoinBelowRight: { borderBottomRightRadius: 7 },
    bubbleHighlight: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: isDark ? '#C7B9FF' : '#5846AA',
      backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(24,21,31,0.07)',
    },
    messageReply: {
      minWidth: 126,
      marginBottom: 7,
      borderLeftWidth: 3,
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },
    messageReplyBody: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    messageReplyCopy: { flex: 1, minWidth: 0 },
    messageReplyThumbnail: {
      width: 42,
      height: 42,
      borderRadius: 8,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(0,0,0,0.12)',
    },
    replyThumbnailWrap: { position: 'relative' },
    replyThumbnailBadge: {
      position: 'absolute',
      right: 3,
      bottom: 3,
      minWidth: 22,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
      backgroundColor: 'rgba(10,8,14,0.76)',
    },
    replyThumbnailBadgeText: { color: '#FFFFFF', fontSize: 9, lineHeight: 12 },
    messageReplyLeft: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F1F0F4',
      borderLeftColor: '#7B68E0',
    },
    messageReplyRight: {
      backgroundColor: 'rgba(255,255,255,0.13)',
      borderLeftColor: 'rgba(255,255,255,0.75)',
    },
    messageReplyAuthor: { fontSize: 10, lineHeight: 14, marginBottom: 1 },
    messageReplyAuthorLeft: { color: isDark ? '#BEB0FF' : '#654FC1' },
    messageReplyAuthorRight: { color: '#FFFFFF' },
    messageReplyText: { fontSize: 11, lineHeight: 16 },
    messageReplyTextLeft: { color: isDark ? '#B8B0C4' : '#6E6679' },
    messageReplyTextRight: { color: 'rgba(255,255,255,0.76)' },
    bubbleLinkLeft: {
      color: isDark ? '#BEB0FF' : '#5342B4',
      textDecorationLine: 'underline',
    },
    bubbleLinkRight: { color: '#FFFFFF', textDecorationLine: 'underline' },
    menuBackdrop: { flex: 1, backgroundColor: 'rgba(8,6,14,0.35)' },
    menuCard: {
      position: 'absolute',
      overflow: 'hidden',
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(24,21,31,0.09)',
      backgroundColor: isDark ? '#24222B' : '#FFFFFF',
      elevation: 8,
    },
    menuItem: {
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
    },
    menuItemPressed: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(24,21,31,0.05)',
    },
    menuIcon: { color: isDark ? '#E9E7EE' : '#3D3946' },
    menuLabel: { fontSize: 14, lineHeight: 19 },
    menuDivider: {
      height: StyleSheet.hairlineWidth,
      marginHorizontal: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(24,21,31,0.08)',
    },
    menuLabelDestructive: { color: isDark ? '#FF9AA4' : '#C0392F' },
    menuIconDestructive: { color: isDark ? '#FF9AA4' : '#C0392F' },
    bubbleTextLeft: { color: isDark ? '#F7F3FC' : '#292432', fontSize: 15, lineHeight: 21 },
    bubbleTextRight: { color: '#FFFFFF', fontSize: 15, lineHeight: 21 },
    bubbleMeta: {
      minHeight: 14,
      marginTop: 3,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 4,
    },
    messageTimeLeft: { color: isDark ? '#9F97AA' : '#8A8491', fontSize: 9, lineHeight: 12 },
    messageTimeRight: { color: 'rgba(255,255,255,0.68)', fontSize: 9, lineHeight: 12 },
    pendingMessageLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 9, lineHeight: 12 },
    failedMessageLabel: { color: '#FFD0D4', fontSize: 9, lineHeight: 12, fontWeight: '700' },
    messageReceipt: {
      width: 17,
      height: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    messageReceiptSecond: { marginLeft: -5 },
    messageReceiptSent: { color: 'rgba(255,255,255,0.68)' },
    messageReceiptRead: { color: '#8CE8C3' },
    pendingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.65)' },
    editBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 9,
      backgroundColor: isDark ? '#18161E' : '#FFFFFF',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: border,
    },
    editBannerCopy: { flex: 1, minWidth: 0 },
    editBannerTitle: {
      color: isDark ? '#C5BAFF' : '#604DB7',
      fontSize: 11,
      lineHeight: 15,
    },
    editBannerHint: {
      color: isDark ? '#9A93A6' : '#7A7285',
      fontSize: 10,
      lineHeight: 14,
    },
    editBannerClose: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editedLabel: { fontSize: 9, lineHeight: 12, fontStyle: 'italic' },
    inputToolbarJoined: { borderTopWidth: 0 },
    inputToolbar: {
      minHeight: 62,
      paddingHorizontal: 10,
      paddingTop: 8,
      backgroundColor: isDark ? '#18161E' : '#FFFFFF',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: border,
    },
    inputPrimary: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'flex-end',
      borderRadius: 23,
      backgroundColor: isDark ? '#25232C' : '#F1F0F4',
      paddingLeft: 8,
      paddingRight: 4,
    },
    imageAction: {
      width: 44,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageActionIcon: { color: isDark ? '#A9A4B3' : '#6E6979' },
    // Gifted Chat's Composer only auto-grows the input on web; on native it leaves `height`
    // undefined and relies on the multiline input measuring its own content. Never give this
    // style `flex`: the toolbar is measured against the space left above the keyboard, so a
    // flexible input immediately fills it and `maxHeight` becomes a fixed height instead of a
    // ceiling. Content-sized height means one line is `minHeight`, each further line adds
    // `lineHeight`, and the input scrolls internally once it reaches `maxHeight`.
    composer: {
      alignSelf: 'stretch',
      minHeight: 46,
      maxHeight: 110,
      paddingTop: 13,
      paddingBottom: 13,
      paddingHorizontal: 7,
      color: isDark ? '#F5F1FA' : '#292432',
      fontSize: 14,
      lineHeight: 20,
      textAlignVertical: 'top',
    },
    placeholder: { color: isDark ? '#8E879A' : '#918A99' },
    sendContainer: { width: 44, height: 46, alignItems: 'center', justifyContent: 'center' },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6B57D6',
    },
    sendButtonDisabled: { opacity: 0.42 },
    replySwipeAction: { width: 50, alignItems: 'center', justifyContent: 'center' },
    replySwipeIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6B57D6',
    },
    replyPreview: {
      minHeight: 54,
      marginHorizontal: 2,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(24,21,31,0.09)',
      backgroundColor: isDark ? '#24222B' : '#F3F2F6',
    },
    replyPreviewAccent: { width: 4, alignSelf: 'stretch', backgroundColor: '#7B68E0' },
    replyPreviewCopy: { flex: 1, minWidth: 0, paddingHorizontal: 11, paddingVertical: 8 },
    replyPreviewTitle: { color: isDark ? '#C5BAFF' : '#604DB7', fontSize: 10, lineHeight: 14 },
    replyPreviewText: {
      color: isDark ? '#B4ADBF' : '#716A7B',
      fontSize: 11,
      lineHeight: 16,
      marginTop: 1,
    },
    replyPreviewThumbnail: {
      width: 42,
      height: 42,
      borderRadius: 9,
      borderCurve: 'continuous',
      marginRight: 4,
      backgroundColor: 'rgba(0,0,0,0.12)',
    },
    replyPreviewClose: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 4,
    },
    replyPreviewCloseColor: { color: isDark ? '#B7AFBF' : '#756D7F' },
    olderMessagesLoader: {
      minHeight: 40,
      marginVertical: 8,
      marginHorizontal: 20,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      alignSelf: 'center',
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(24,21,31,0.09)',
      backgroundColor: isDark ? '#211F28' : '#F1F0F4',
    },
    olderMessagesAccent: { color: isDark ? '#B7A8FF' : '#6B57D6' },
    olderMessagesText: { color: isDark ? '#B8B0C4' : '#6D6578', fontSize: 10, lineHeight: 15 },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 9,
      backgroundColor: isDark ? '#4A2630' : '#FFF0F1',
    },
    errorBannerText: {
      flex: 1,
      color: isDark ? '#FFBAC1' : '#A93240',
      fontSize: 11,
      lineHeight: 16,
    },
    centered: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    loadingText: { fontSize: 13, marginTop: 14 },
    errorTitle: { fontSize: 18, textAlign: 'center', marginBottom: 8 },
    errorMessage: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
    errorButton: {
      marginTop: 20,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 10,
      backgroundColor: '#6B57D6',
    },
    errorButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  });
};

/**
 * Every message row asks for these styles through several components, so building the sheet per
 * call meant allocating the whole thing dozens of times per render pass of a long thread. There is
 * one sheet per theme instead, which also keeps style identity stable between renders.
 */
const styleSheets = new Map<AppTheme, ChatStyles>();

export const useChatStyles = () => {
  const { theme } = useAppTheme();

  const cached = styleSheets.get(theme);
  if (cached) return cached;

  const styles = createChatStyles(theme);
  styleSheets.set(theme, styles);
  return styles;
};

export type ChatStyles = ReturnType<typeof createChatStyles>;
