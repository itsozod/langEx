import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/theme-provider';
import { usePublicUser } from '@/screens/discover/hooks';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chat-store';
import { useUserStore } from '@/shared/store/user.store';

import { ChatHeader } from './components/chat-header';
import { ChatErrorBanner, ChatErrorState, ChatLoadingState } from './components/chat-status';
import { ChatThread } from './components/chat-thread';
import { useConversation } from './hooks';
import { useActiveConversationPresence } from './hooks/use-active-conversation-presence';
import { useChatMessaging } from './hooks/use-chat-messaging';
import { useChatRoom } from './hooks/use-chat-room';
import {
  getActiveDeleteConversationVariables,
  useDeleteConversation,
} from './hooks/use-delete-conversation';
import { useUserPresence } from './hooks/use-user-presence';
import { useChatStyles } from './styles/chat-styles';
import type { ChatThreadProps } from './types/chat-thread-types';
import type { ChatParticipant, UserPresence } from './types/message.types';

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
  const currentUser = useUserStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setActiveMessages = useChatStore((state) => state.setActiveMessages);
  const syncActiveMessages = useChatStore((state) => state.syncActiveMessages);
  const typingUsers = useChatStore((state) => state.typingUsers);
  const listParticipant = useChatStore((state) =>
    state.conversations
      .find((item) => item.id === conversationId)
      ?.participants.find((participant) => participant.id !== currentUser?.id),
  );
  const [anchorMessageId, setAnchorMessageId] = useState<string | null>(null);
  const [anchorWindowVersion, setAnchorWindowVersion] = useState(0);
  const query = useConversation(conversationId);
  // The newest window is never torn down, so returning to it is instant and the screen keeps its
  // loading, error and participant state while an older window is being fetched.
  const anchorQuery = useConversation(
    anchorMessageId ? conversationId : undefined,
    anchorMessageId,
    anchorWindowVersion,
  );
  const refetchMessageWindow = anchorQuery.refetch;
  const activeQuery = anchorMessageId ? anchorQuery : query;
  const participantQuery = usePublicUser(isDraft ? participantId : undefined);
  const deleteConversation = useDeleteConversation();
  const windowKey = anchorMessageId ? `${anchorMessageId}:${anchorWindowVersion}` : 'latest';

  const draftParticipant = useMemo<ChatParticipant | undefined>(() => {
    const user = participantQuery.data?.user;
    return user
      ? {
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          country: user.country,
          isDeleted: user.isDeleted,
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
        ? { id: 'new', participants: [draftParticipant], messages: [], isReadOnly: false }
        : undefined),
    [conversationPages, draftParticipant, isDraft],
  );
  const otherParticipant = useMemo(
    () =>
      conversation?.participants.find((participant) => participant.id !== currentUser?.id) ??
      conversation?.participants[0],
    [conversation?.participants, currentUser?.id],
  );
  const initialPresence = useMemo<UserPresence | undefined>(
    () =>
      listParticipant && typeof listParticipant.isOnline === 'boolean'
        ? {
            userId: listParticipant.id,
            isOnline: listParticipant.isOnline,
            lastSeenAt: listParticipant.lastSeenAt ?? null,
          }
        : undefined,
    [listParticipant],
  );
  const presenceQuery = useUserPresence(otherParticipant?.id, initialPresence);

  // Clear the shared window only when leaving or switching chats. Clearing on mount races the
  // layout-phase cache hydration below: cached messages are restored first and then erased by a
  // passive effect, which renders the empty state beside an in-flight older-page loader.
  useLayoutEffect(() => () => setActiveMessages([]), [routeId, setActiveMessages]);

  // Keep the previous window until the query resolves, then synchronize in the layout phase so the
  // query result and Gifted Chat rows reach native in one paint. Synchronizing instead of merging
  // also releases evicted pages while retaining optimistic rows outside the server window.
  useLayoutEffect(() => {
    if (!activeWindowPages) return;
    syncActiveMessages(paginatedMessages);
  }, [activeWindowPages, paginatedMessages, syncActiveMessages, windowKey]);

  const serverParticipantReadAt = conversation?.reads?.find(
    (readState) => readState.userId === otherParticipant?.id,
  )?.lastReadAt;
  const { participantReadAt, socketError, setSocketError } = useChatRoom({
    conversationId,
    currentUserId: currentUser?.id,
    isHistoricalWindow: anchorMessageId !== null,
    participantId: otherParticipant?.id,
    participantReadAt: serverParticipantReadAt,
    token,
  });
  useActiveConversationPresence(conversationId);
  const messaging = useChatMessaging({
    conversation,
    conversationId,
    currentUser,
    draftParticipant,
    participantId,
    participantReadAt,
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
  const confirmDeleteConversation = useCallback(() => {
    if (!conversationId || deleteConversation.isPending) return;
    const name = otherParticipant?.displayName?.trim() || 'this language partner';

    Alert.alert(
      `Delete conversation with ${name}?`,
      `This removes the conversation from your account and can’t be undone. It does not unsend messages from ${name}’s account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete conversation',
          style: 'destructive',
          onPress: () => {
            const variables = getActiveDeleteConversationVariables(conversationId);
            if (!variables) {
              setSocketError('Your account session changed. Open the conversation and try again.');
              return;
            }

            deleteConversation.mutate(variables, {
              onSuccess: () => {
                if (process.env.EXPO_OS === 'ios') {
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                router.replace('/(tabs)/chats');
              },
              onError: (error) => {
                if (process.env.EXPO_OS === 'ios') {
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }
                setSocketError(
                  error instanceof Error
                    ? error.message
                    : 'Conversation could not be deleted. Try again.',
                );
              },
            });
          },
        },
      ],
    );
  }, [conversationId, deleteConversation, otherParticipant?.displayName, setSocketError]);
  const loadOlderMessages = useCallback(() => {
    if (!conversationId || !activeQuery.hasNextPage || activeQuery.isFetchingNextPage) return;
    void activeQuery.fetchNextPage();
  }, [activeQuery, conversationId]);
  const loadNewerMessages = useCallback(() => {
    if (!conversationId || !activeQuery.hasPreviousPage || activeQuery.isFetchingPreviousPage)
      return;
    void activeQuery.fetchPreviousPage();
  }, [activeQuery, conversationId]);
  const openMessageWindow = useCallback((messageId: string) => {
    // A bounded historical query can evict its original around-page after the reader pages away.
    // Give every unloaded-target request a fresh key, including requests made after returning to
    // latest, so another tap can never reopen a cached window that no longer contains its target.
    setAnchorWindowVersion((version) => version + 1);
    setAnchorMessageId(messageId);
  }, []);
  const retryMessageWindow = useCallback(() => {
    void refetchMessageWindow();
  }, [refetchMessageWindow]);
  const openLatestWindow = useCallback(() => {
    setAnchorMessageId(null);
  }, []);

  const hasValidTarget = isDraft ? Boolean(participantId) : Boolean(conversationId);
  const isLoading = hasValidTarget && (isDraft ? participantQuery.isPending : query.isPending);
  const isError = isDraft ? participantQuery.isError : query.isError;
  const loadError = isDraft ? participantQuery.error : query.error;

  if (isLoading) return <ChatLoadingState />;
  if (isError || !conversation) {
    const error = hasValidTarget ? loadError : new Error('The conversation link is invalid.');
    return <ChatErrorState error={error} onBack={goBack} />;
  }

  const chatThreadProps = {
    conversation: {
      id: conversationId,
      currentUser,
      isHistoricalWindow: anchorMessageId !== null,
      isReadOnly: conversation.isReadOnly,
    },
    history: {
      hasNewerMessages: Boolean(activeQuery.hasPreviousPage),
      hasOlderMessages: Boolean(activeQuery.hasNextPage),
      isLoadingMessageWindow:
        anchorMessageId !== null &&
        !anchorQuery.data &&
        (anchorQuery.isPending || anchorQuery.isFetching),
      newerLoadFailed: activeQuery.isFetchPreviousPageError,
      olderLoadFailed: activeQuery.isFetchNextPageError,
      messageWindowLoadFailed:
        anchorMessageId !== null && anchorQuery.isError && !anchorQuery.isFetching,
      isLoadingNewerMessages: activeQuery.isFetchingPreviousPage,
      isLoadingOlderMessages: activeQuery.isFetchingNextPage,
      onJumpToLatest: openLatestWindow,
      onLoadNewerMessages: loadNewerMessages,
      onLoadOlderMessages: loadOlderMessages,
      onRequestMessageWindow: openMessageWindow,
      onRetryMessageWindow: retryMessageWindow,
    },
    messaging,
    presentation: {
      theme,
      topInset: insets.top,
      typingUsers,
    },
  } satisfies ChatThreadProps;

  return (
    <GradientBackground>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <ChatHeader
          deletePending={deleteConversation.isPending}
          participant={otherParticipant}
          presence={presenceQuery.data?.presence}
          presencePending={presenceQuery.isPending}
          presenceUnavailable={presenceQuery.isError}
          onBack={goBack}
          onDelete={confirmDeleteConversation}
          onOpenProfile={openProfile}
        />
        {socketError ? (
          <ChatErrorBanner message={socketError} onDismiss={() => setSocketError(null)} />
        ) : null}
        <ChatThread {...chatThreadProps} />
      </View>
    </GradientBackground>
  );
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
