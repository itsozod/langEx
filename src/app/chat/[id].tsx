import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  GiftedChat,
  InputToolbar,
  Send,
  type BubbleProps,
  type IMessage,
  type InputToolbarProps,
  type MessageProps,
  type SendProps,
} from 'react-native-gifted-chat';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { chatQueryKeys, useConversation } from '@/screens/chat/hooks';
import { markConversationRead as markConversationReadRequest } from '@/screens/chat/api';
import { usePublicUser } from '@/screens/discover/hooks';
import type {
  ChatParticipant,
  ConversationResponse,
  ConversationsResponse,
  Message,
} from '@/screens/chat/types';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { prepareSocketAuth, socket } from '@/shared/lib/socket';
import { queryClient } from '@/providers/query-provider';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chatStore';

type GiftedMessage = IMessage & { pending?: boolean };

const CHAT_HEADER_HEIGHT = 68;

function initials(name?: string | null) {
  const value = name?.trim() || 'Language partner';
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<Message>;
  return (
    typeof message.id === 'string' &&
    typeof message.content === 'string' &&
    typeof message.senderId === 'string' &&
    typeof message.createdAt === 'string'
  );
}

function isSameSenderOnSameDay(first?: GiftedMessage, second?: GiftedMessage) {
  // Gifted Chat uses an empty object for a missing adjacent message at runtime.
  // Its TypeScript definitions do not reflect that, so guard the nested user too.
  const firstUserId = first?.user?._id;
  const secondUserId = second?.user?._id;
  if (firstUserId == null || secondUserId == null || firstUserId !== secondUserId) return false;

  const firstCreatedAt = first?.createdAt;
  const secondCreatedAt = second?.createdAt;
  if (firstCreatedAt == null || secondCreatedAt == null) return false;

  const firstDate = new Date(firstCreatedAt);
  const secondDate = new Date(secondCreatedAt);
  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) return false;

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function formatMessageTime(value: Date | number) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    participantId?: string | string[];
  }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const participantId = Array.isArray(params.participantId)
    ? params.participantId[0]
    : params.participantId;
  const isDraft = routeId === 'new' && Boolean(participantId);
  const conversationId = isDraft ? undefined : routeId;
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const currentUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const currentUserId = currentUser?.id;
  const query = useConversation(conversationId);
  const participantQuery = usePublicUser(isDraft ? participantId : undefined);
  const activeMessages = useChatStore((state) => state.activeMessages);
  const typingUsers = useChatStore((state) => state.typingUsers);
  const setActiveMessages = useChatStore((state) => state.setActiveMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const removeMessage = useChatStore((state) => state.removeMessage);
  const setTyping = useChatStore((state) => state.setTyping);
  const clearConversationUnread = useChatStore((state) => state.clearConversationUnread);
  const [socketError, setSocketError] = useState<string | null>(null);

  const markConversationRead = useCallback(async () => {
    if (!token || !conversationId) return;

    clearConversationUnread(conversationId);

    try {
      const readState = await markConversationReadRequest(conversationId);
      queryClient.setQueryData<ConversationsResponse>(chatQueryKeys.conversations(), (current) =>
        current
          ? {
              ...current,
              conversations: current.conversations.map((item) =>
                item.id === readState.conversationId
                  ? { ...item, unreadCount: readState.unreadCount }
                  : item,
              ),
            }
          : current,
      );
    } catch {
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    }
  }, [clearConversationUnread, conversationId, token]);

  const draftParticipant = useMemo(
    () =>
      participantQuery.data?.user
        ? {
            id: participantQuery.data.user.id,
            displayName: participantQuery.data.user.displayName,
            avatarUrl: participantQuery.data.user.avatarUrl,
            country: participantQuery.data.user.country,
          }
        : undefined,
    [participantQuery.data],
  );
  const conversation = useMemo(
    () =>
      query.data?.conversation ??
      (isDraft && draftParticipant
        ? { id: 'new', participants: [draftParticipant], messages: [] }
        : undefined),
    [draftParticipant, isDraft, query.data?.conversation],
  );
  const otherParticipant = useMemo(
    () =>
      conversation?.participants.find((participant) => participant.id !== currentUserId) ??
      conversation?.participants[0],
    [conversation?.participants, currentUserId],
  );

  useEffect(() => {
    setActiveMessages([]);
    return () => setActiveMessages([]);
  }, [routeId, setActiveMessages]);

  useEffect(() => {
    void markConversationRead();
  }, [markConversationRead]);

  useEffect(() => {
    if (conversation?.messages) setActiveMessages(conversation.messages);
  }, [conversation?.messages, setActiveMessages]);

  useEffect(() => {
    if (!conversationId) return;

    prepareSocketAuth();

    const joinRoom = () => {
      socket.emit('join_room', conversationId, (response) => {
        if (!response.ok) setSocketError(response.error ?? 'Unable to join this chat.');
      });
    };
    const handleMessage = (message: Message) => {
      if (
        isMessage(message) &&
        (!message.conversationId || message.conversationId === conversationId)
      ) {
        addMessage(message);
        if (message.senderId !== currentUserId) void markConversationRead();
      }
    };
    const handleTyping = ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) setTyping(userId, true);
    };
    const handleStopTyping = ({ userId }: { userId: string }) => setTyping(userId, false);
    const handleChatError = ({ error }: { error: string }) => setSocketError(error);
    const handleConnectError = (error: Error) => setSocketError(error.message);

    socket.on('connect', joinRoom);
    socket.on('receive_message', handleMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('chat_error', handleChatError);
    socket.on('connect_error', handleConnectError);

    if (socket.connected) joinRoom();
    else socket.connect();

    return () => {
      socket.emit('stop_typing', conversationId);
      socket.off('connect', joinRoom);
      socket.off('receive_message', handleMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('chat_error', handleChatError);
      socket.off('connect_error', handleConnectError);
      useChatStore.setState({ typingUsers: [] });
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversation(conversationId),
      });
    };
  }, [addMessage, conversationId, currentUserId, markConversationRead, setTyping]);

  const giftedMessages = useMemo<GiftedMessage[]>(() => {
    return activeMessages
      .map((message) => {
        const sender = conversation?.participants.find(
          (participant) => participant.id === message.senderId,
        );
        return {
          _id: message.id,
          text: message.content,
          createdAt: new Date(message.createdAt),
          pending: message.isOptimistic,
          user: {
            _id: message.senderId,
            name: sender?.displayName || (message.senderId === currentUserId ? 'You' : 'Partner'),
            avatar: sender?.avatarUrl || undefined,
          },
        };
      })
      .sort((first, second) => Number(second.createdAt) - Number(first.createdAt));
  }, [activeMessages, conversation?.participants, currentUserId]);

  const handleInputChange = useCallback(
    (text: string) => {
      if (!conversationId || !socket.connected) return;
      socket.emit(text.trim() ? 'typing' : 'stop_typing', conversationId);
    },
    [conversationId],
  );

  const handleSend = useCallback(
    (messages: GiftedMessage[]) => {
      const content = messages[0]?.text.trim();
      if (!content || !currentUserId || (!conversationId && !participantId)) return;

      if (conversationId) socket.emit('stop_typing', conversationId);
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        content,
        senderId: currentUserId,
        conversationId,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      addMessage(optimisticMessage);
      if (conversationId) {
        queryClient.setQueryData<ConversationResponse>(
          chatQueryKeys.conversation(conversationId),
          (current) =>
            current
              ? {
                  ...current,
                  conversation: {
                    ...current.conversation,
                    messages: [...current.conversation.messages, optimisticMessage],
                  },
                }
              : current,
        );
      }

      prepareSocketAuth();
      if (!socket.connected) socket.connect();
      socket.emit(
        'send_message',
        conversationId ? { conversationId, content } : { participantId, content },
        (response) => {
          if (!response.ok) {
            removeMessage(optimisticId);
            if (conversationId) {
              queryClient.setQueryData<ConversationResponse>(
                chatQueryKeys.conversation(conversationId),
                (current) =>
                  current
                    ? {
                        ...current,
                        conversation: {
                          ...current.conversation,
                          messages: current.conversation.messages.filter(
                            (message) => message.id !== optimisticId,
                          ),
                        },
                      }
                    : current,
              );
            }
            setSocketError(response.error ?? 'Message could not be sent.');
            return;
          }

          if (response.message && isMessage(response.message)) {
            const savedMessage = response.message;
            addMessage(savedMessage);
            if (conversationId) {
              queryClient.setQueryData<ConversationResponse>(
                chatQueryKeys.conversation(conversationId),
                (current) =>
                  current
                    ? {
                        ...current,
                        conversation: {
                          ...current.conversation,
                          messages: current.conversation.messages.map((message) =>
                            message.id === optimisticId ? savedMessage : message,
                          ),
                        },
                      }
                    : current,
              );
            }
          }
          void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
          if (!conversationId && response.conversationId) {
            if (response.message && isMessage(response.message) && draftParticipant) {
              queryClient.setQueryData<ConversationResponse>(
                chatQueryKeys.conversation(response.conversationId),
                {
                  conversation: {
                    id: response.conversationId,
                    participants: [
                      {
                        id: currentUserId,
                        displayName: currentUser?.displayName ?? null,
                        avatarUrl: currentUser?.avatarUrl ?? null,
                        country: currentUser?.country ?? null,
                      },
                      draftParticipant,
                    ],
                    messages: [response.message],
                  },
                },
              );
            }
            router.setParams({ id: response.conversationId });
          }
        },
      );
    },
    [
      addMessage,
      conversationId,
      currentUser,
      currentUserId,
      draftParticipant,
      participantId,
      removeMessage,
    ],
  );

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/chats');
  };

  const isLoading = isDraft ? participantQuery.isPending : query.isPending;
  const loadError = isDraft ? participantQuery.error : query.error;

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#6654C7" />
          <ThemedText themeColor="textSecondary" style={styles.loadingText}>
            Loading messages…
          </ThemedText>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if ((isDraft ? participantQuery.isError : query.isError) || !conversation) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <ThemedText type="bold" style={styles.errorTitle}>
            Couldn&apos;t open this chat
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.errorMessage}>
            {loadError instanceof Error ? loadError.message : 'This conversation is unavailable.'}
          </ThemedText>
          <Pressable onPress={goBack} style={styles.errorButton}>
            <ThemedText style={styles.errorButtonText}>Back to chats</ThemedText>
          </Pressable>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ChatHeader participant={otherParticipant} onBack={goBack} />
        {socketError ? (
          <Pressable onPress={() => setSocketError(null)} style={styles.errorBanner}>
            <SymbolView
              name={{ ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' }}
              size={16}
              tintColor={styles.errorBannerText.color}
            />
            <ThemedText numberOfLines={2} style={styles.errorBannerText}>
              {socketError}
            </ThemedText>
          </Pressable>
        ) : null}

        <View style={styles.chat}>
          <GiftedChat<GiftedMessage>
            messages={giftedMessages}
            onSend={handleSend}
            user={{
              _id: currentUser?.id ?? '',
              name: currentUser?.displayName || currentUser?.email || 'You',
              avatar: currentUser?.avatarUrl || undefined,
            }}
            colorScheme={theme}
            isTyping={typingUsers.length > 0}
            isSendButtonAlwaysVisible
            isDayAnimationEnabled={false}
            renderAvatar={null}
            renderMessage={(props) => <ChatMessage {...props} />}
            renderInputToolbar={(props) => <ChatInputToolbar {...props} />}
            renderSend={(props) => <ChatSend {...props} />}
            renderTypingIndicator={() =>
              typingUsers.length ? (
                <ThemedText style={styles.typingText}>typing...</ThemedText>
              ) : null
            }
            renderChatEmpty={() => (
              <View style={styles.emptyChat}>
                <ThemedText type="bold" style={styles.emptyTitle}>
                  Say hello 👋
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.emptyMessage}>
                  Send the first message to start your conversation.
                </ThemedText>
              </View>
            )}
            messagesContainerStyle={styles.messagesContainer}
            listProps={{
              contentContainerStyle: styles.messageList,
              keyboardShouldPersistTaps: 'handled',
            }}
            keyboardAvoidingViewProps={{
              automaticOffset: false,
              keyboardVerticalOffset: insets.top + CHAT_HEADER_HEIGHT,
            }}
            textInputProps={{
              onChangeText: handleInputChange,
              placeholder: 'Write a message…',
              placeholderTextColor: styles.placeholder.color,
              style: styles.composer,
              multiline: true,
            }}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

function ChatHeader({
  participant,
  onBack,
}: {
  participant?: ChatParticipant;
  onBack: () => void;
}) {
  const styles = useStyles();
  const name = participant?.displayName?.trim() || 'Language partner';
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to chats"
        hitSlop={10}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
          size={22}
          weight="semibold"
          tintColor={styles.headerIcon.color}
        />
      </Pressable>

      <View style={styles.headerAvatarWrap}>
        {participant?.avatarUrl ? (
          <Image source={{ uri: participant.avatarUrl }} contentFit="cover" style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ThemedText type="bold" style={styles.initials}>
              {initials(name)}
            </ThemedText>
          </View>
        )}
        {participant?.country ? (
          <View style={styles.headerCountryBadge}>
            <CountryFlag country={participant.country} size={11} boxSize={16} />
          </View>
        ) : null}
      </View>
      <View style={styles.headerCopy}>
        <ThemedText type="bold" numberOfLines={1} style={styles.headerName}>
          {name}
        </ThemedText>
        <ThemedText style={styles.onlineText}>Conversation</ThemedText>
      </View>
    </View>
  );
}

function ChatBubble(props: BubbleProps<GiftedMessage>) {
  const styles = useStyles();
  const { currentMessage, nextMessage, position, previousMessage } = props;
  const joinsAbove = isSameSenderOnSameDay(currentMessage, previousMessage);
  const joinsBelow = isSameSenderOnSameDay(currentMessage, nextMessage);

  return (
    <View
      style={[
        styles.bubble,
        position === 'right' ? styles.bubbleRight : styles.bubbleLeft,
        joinsAbove &&
          (position === 'right' ? styles.bubbleJoinAboveRight : styles.bubbleJoinAboveLeft),
        joinsBelow &&
          (position === 'right' ? styles.bubbleJoinBelowRight : styles.bubbleJoinBelowLeft),
      ]}>
      <ThemedText style={position === 'right' ? styles.bubbleTextRight : styles.bubbleTextLeft}>
        {currentMessage.text}
      </ThemedText>
      <View style={styles.bubbleMeta}>
        <ThemedText style={position === 'right' ? styles.messageTimeRight : styles.messageTimeLeft}>
          {formatMessageTime(currentMessage.createdAt)}
        </ThemedText>
        {position === 'right' && currentMessage.pending ? <View style={styles.pendingDot} /> : null}
      </View>
    </View>
  );
}

function ChatMessage(props: MessageProps<GiftedMessage>) {
  const styles = useStyles();
  const joinsNext = isSameSenderOnSameDay(props.currentMessage, props.nextMessage);
  return (
    <View
      style={[
        styles.messageRow,
        props.position === 'right' ? styles.messageRowRight : styles.messageRowLeft,
        joinsNext ? styles.messageRowGrouped : styles.messageRowSeparated,
      ]}>
      <ChatBubble {...props} />
    </View>
  );
}

function ChatInputToolbar(props: InputToolbarProps<GiftedMessage>) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <InputToolbar
      {...props}
      containerStyle={[styles.inputToolbar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      primaryStyle={styles.inputPrimary}
    />
  );
}

function ChatSend(props: SendProps<GiftedMessage>) {
  const styles = useStyles();
  return (
    <Send {...props} containerStyle={styles.sendContainer}>
      <View style={[styles.sendButton, !props.text?.trim() && styles.sendButtonDisabled]}>
        <SymbolView
          name={{ ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' }}
          size={20}
          weight="bold"
          tintColor="#FFFFFF"
        />
      </View>
    </Send>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const border = isDark ? 'rgba(190,176,255,0.13)' : 'rgba(97,76,190,0.10)';

  return StyleSheet.create({
    safeArea: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
    header: {
      height: CHAT_HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: border,
      backgroundColor: isDark ? 'rgba(25,21,35,0.94)' : 'rgba(250,249,253,0.96)',
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 7,
    },
    pressed: { opacity: 0.65 },
    headerIcon: { color: isDark ? '#F5F1FF' : '#312C3C' },
    headerAvatarWrap: { width: 42, height: 42 },
    avatar: { width: 42, height: 42, borderRadius: 21 },
    avatarPlaceholder: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#55488A' : '#E8E2FF',
    },
    headerCountryBadge: {
      position: 'absolute',
      right: -3,
      bottom: -2,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      borderWidth: 2,
      borderColor: isDark ? '#191523' : '#FAF9FD',
      backgroundColor: isDark ? '#302A3E' : '#FFFFFF',
    },
    initials: { color: isDark ? '#F2EEFF' : '#5846AA', fontSize: 12, lineHeight: 17 },
    headerCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
    headerName: { fontSize: 15, lineHeight: 20 },
    onlineText: { color: isDark ? '#9F96AD' : '#7A7285', fontSize: 10, lineHeight: 15 },
    chat: { flex: 1, backgroundColor: isDark ? '#181420' : '#F8F6FC' },
    messagesContainer: { backgroundColor: isDark ? '#181420' : '#F8F6FC' },
    messageList: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10 },
    messageRow: { maxWidth: '78%' },
    messageRowLeft: { alignSelf: 'flex-start', marginLeft: 2 },
    messageRowRight: { alignSelf: 'flex-end', marginRight: 2 },
    messageRowGrouped: { marginBottom: 3 },
    messageRowSeparated: { marginBottom: 10 },
    bubble: {
      minWidth: 74,
      maxWidth: '100%',
      borderRadius: 20,
      paddingTop: 10,
      paddingHorizontal: 13,
      paddingBottom: 7,
    },
    bubbleLeft: {
      backgroundColor: isDark ? '#302A3D' : '#FFFFFF',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      shadowColor: '#000000',
      shadowOpacity: isDark ? 0.12 : 0.06,
      shadowRadius: 7,
      shadowOffset: { width: 0, height: 3 },
    },
    bubbleRight: {
      backgroundColor: isDark ? '#735FDC' : '#6654C7',
      shadowColor: '#503CB9',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    bubbleJoinAboveLeft: { borderTopLeftRadius: 7 },
    bubbleJoinBelowLeft: { borderBottomLeftRadius: 7 },
    bubbleJoinAboveRight: { borderTopRightRadius: 7 },
    bubbleJoinBelowRight: { borderBottomRightRadius: 7 },
    bubbleTextLeft: {
      color: isDark ? '#F7F3FC' : '#292432',
      fontSize: 15,
      lineHeight: 21,
    },
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
    pendingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.65)' },
    inputToolbar: {
      minHeight: 62,
      paddingHorizontal: 10,
      paddingTop: 8,
      backgroundColor: isDark ? '#211C2A' : '#FFFFFF',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: border,
    },
    inputPrimary: {
      minHeight: 46,
      alignItems: 'flex-end',
      borderRadius: 23,
      backgroundColor: isDark ? '#302A3C' : '#F2EFF6',
      paddingLeft: 8,
      paddingRight: 4,
    },
    composer: {
      flex: 1,
      minHeight: 42,
      maxHeight: 110,
      paddingTop: 11,
      paddingBottom: 9,
      paddingHorizontal: 7,
      color: isDark ? '#F5F1FA' : '#292432',
      fontSize: 14,
      lineHeight: 20,
    },
    placeholder: { color: isDark ? '#8E879A' : '#918A99' },
    sendContainer: { width: 44, height: 46, alignItems: 'center', justifyContent: 'center' },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6654C7',
    },
    sendButtonDisabled: { opacity: 0.42 },
    typingText: {
      color: isDark ? '#B9AECE' : '#756D82',
      fontSize: 11,
      lineHeight: 16,
      marginLeft: 17,
      marginBottom: 5,
    },
    emptyChat: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 34,
      ...Platform.select({
        ios: { transform: [{ scaleY: -1 }] },
      }),
    },
    emptyTitle: { fontSize: 17, lineHeight: 23, textAlign: 'center' },
    emptyMessage: { marginTop: 6, fontSize: 12, lineHeight: 19, textAlign: 'center' },
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
      backgroundColor: '#6654C7',
    },
    errorButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  });
};
