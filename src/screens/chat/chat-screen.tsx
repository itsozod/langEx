import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { useAppTheme } from '@/providers/theme-provider';
import { usePublicUser } from '@/screens/discover/hooks';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chatStore';

import { ChatHeader } from './components/chat-header';
import { ChatErrorBanner, ChatErrorState, ChatLoadingState } from './components/chat-status';
import { ChatThread } from './components/chat-thread';
import { useChatMessaging } from './hooks/use-chat-messaging';
import { useChatRoom } from './hooks/use-chat-room';
import { useConversation } from './hooks';
import { useChatStyles } from './styles/chat-styles';
import type { ChatParticipant } from './types';

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    participantId?: string | string[];
  }>();
  const routeId = firstParam(params.id);
  const participantId = firstParam(params.participantId);
  const isDraft = routeId === 'new' && Boolean(participantId);
  const conversationId = isDraft ? undefined : routeId;
  const styles = useChatStyles();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const currentUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setActiveMessages = useChatStore((state) => state.setActiveMessages);
  const mergeMessages = useChatStore((state) => state.mergeMessages);
  const typingUsers = useChatStore((state) => state.typingUsers);
  const [anchorMessageId, setAnchorMessageId] = useState<string | null>(null);
  const query = useConversation(conversationId);
  // The newest window is never torn down, so returning to it is instant and the screen keeps its
  // loading, error and participant state while an older window is being fetched.
  const anchorQuery = useConversation(
    anchorMessageId ? conversationId : undefined,
    anchorMessageId,
  );
  const activeQuery = anchorMessageId ? anchorQuery : query;
  const participantQuery = usePublicUser(isDraft ? participantId : undefined);
  const windowKey = anchorMessageId ?? 'latest';
  const loadedWindowKeyRef = useRef(windowKey);

  const draftParticipant = useMemo<ChatParticipant | undefined>(() => {
    const user = participantQuery.data?.user;
    return user
      ? {
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          country: user.country,
        }
      : undefined;
  }, [participantQuery.data]);
  const conversationPages = query.data?.pages;
  const activeWindowPages = activeQuery.data?.pages;
  const paginatedMessages = useMemo(
    () => activeWindowPages?.flatMap((page) => page.conversation.messages) ?? [],
    [activeWindowPages],
  );
  const conversation = useMemo(
    () =>
      conversationPages?.[0]?.conversation ??
      (isDraft && draftParticipant
        ? { id: 'new', participants: [draftParticipant], messages: [] }
        : undefined),
    [conversationPages, draftParticipant, isDraft],
  );
  const otherParticipant = useMemo(
    () =>
      conversation?.participants.find((participant) => participant.id !== currentUser?.id) ??
      conversation?.participants[0],
    [conversation?.participants, currentUser?.id],
  );

  useEffect(() => {
    setActiveMessages([]);
    return () => setActiveMessages([]);
  }, [routeId, setActiveMessages]);

  // The previous window stays on screen until the new one has loaded, so jumping never flashes an
  // empty thread. Optimistic messages survive the swap because they are not part of any window yet.
  useEffect(() => {
    if (loadedWindowKeyRef.current === windowKey) {
      mergeMessages(paginatedMessages);
      return;
    }

    if (!paginatedMessages.length) return;
    loadedWindowKeyRef.current = windowKey;
    setActiveMessages([
      ...useChatStore.getState().activeMessages.filter((message) => message.isOptimistic),
      ...paginatedMessages,
    ]);
  }, [mergeMessages, paginatedMessages, setActiveMessages, windowKey]);

  const { socketError, setSocketError } = useChatRoom({
    conversationId,
    currentUserId: currentUser?.id,
    isHistoricalWindow: anchorMessageId !== null,
    token,
  });
  const messaging = useChatMessaging({
    conversation,
    conversationId,
    currentUser,
    draftParticipant,
    participantId,
    setSocketError,
  });

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/chats');
  }, []);
  const openProfile = useCallback(() => {
    if (!otherParticipant?.id) return;
    router.push({
      pathname: '/profile/[id]',
      params: conversationId
        ? { id: otherParticipant.id, returnToConversationId: conversationId }
        : { id: otherParticipant.id },
    });
  }, [conversationId, otherParticipant]);
  const loadOlderMessages = useCallback(() => {
    if (!conversationId || !activeQuery.hasNextPage || activeQuery.isFetchingNextPage) return;
    void activeQuery.fetchNextPage();
  }, [activeQuery, conversationId]);
  const loadNewerMessages = useCallback(() => {
    if (!conversationId || !activeQuery.hasPreviousPage || activeQuery.isFetchingPreviousPage)
      return;
    void activeQuery.fetchPreviousPage();
  }, [activeQuery, conversationId]);
  const openMessageWindow = useCallback((messageId: string) => setAnchorMessageId(messageId), []);
  const openLatestWindow = useCallback(() => setAnchorMessageId(null), []);

  const isLoading = isDraft ? participantQuery.isPending : query.isPending;
  const isError = isDraft ? participantQuery.isError : query.isError;
  const loadError = isDraft ? participantQuery.error : query.error;

  if (isLoading) return <ChatLoadingState />;
  if (isError || !conversation) return <ChatErrorState error={loadError} onBack={goBack} />;

  return (
    <GradientBackground>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <ChatHeader participant={otherParticipant} onBack={goBack} onOpenProfile={openProfile} />
        {socketError ? (
          <ChatErrorBanner message={socketError} onDismiss={() => setSocketError(null)} />
        ) : null}
        <ChatThread
          currentUser={currentUser}
          giftedMessages={messaging.giftedMessages}
          hasNewerMessages={Boolean(activeQuery.hasPreviousPage)}
          hasNextPage={Boolean(activeQuery.hasNextPage)}
          isFetchNextPageError={activeQuery.isFetchNextPageError}
          isFetchingNextPage={activeQuery.isFetchingNextPage}
          isHistoricalWindow={anchorMessageId !== null}
          onEditMessage={messaging.editMessage}
          onInputChange={messaging.handleInputChange}
          onJumpToLatest={openLatestWindow}
          onLoadNewerMessages={loadNewerMessages}
          onLoadOlderMessages={loadOlderMessages}
          onRequestMessageWindow={openMessageWindow}
          onSend={messaging.handleSend}
          onUnsendMessage={messaging.unsendMessage}
          replyingTo={messaging.replyingTo}
          setReplyingTo={messaging.setReplyingTo}
          theme={theme}
          topInset={insets.top}
          typingUsers={typingUsers}
        />
      </View>
    </GradientBackground>
  );
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
