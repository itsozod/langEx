import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
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
  const query = useConversation(conversationId);
  const participantQuery = usePublicUser(isDraft ? participantId : undefined);

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
  const paginatedMessages = useMemo(
    () => conversationPages?.flatMap((page) => page.conversation.messages) ?? [],
    [conversationPages],
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

  useEffect(() => {
    mergeMessages(paginatedMessages);
  }, [mergeMessages, paginatedMessages]);

  const { socketError, setSocketError } = useChatRoom({
    conversationId,
    currentUserId: currentUser?.id,
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
    if (!conversationId || !query.hasNextPage || query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, [conversationId, query]);

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
          hasNextPage={Boolean(query.hasNextPage)}
          isFetchNextPageError={query.isFetchNextPageError}
          isFetchingNextPage={query.isFetchingNextPage}
          onInputChange={messaging.handleInputChange}
          onLoadOlderMessages={loadOlderMessages}
          onSend={messaging.handleSend}
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
