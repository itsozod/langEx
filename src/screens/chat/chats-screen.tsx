import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/theme-provider';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useChatStore } from '@/shared/store/chat-store';
import { useUserStore } from '@/shared/store/user.store';

import {
  ConversationRow,
  ConversationSkeleton,
  getOtherParticipant,
} from './components/conversation-row';
import { useConversations } from './hooks';
import { useChatsStyles } from './styles/chats-styles';
import type { Conversation } from './types/message.types';

export default function ChatsScreen() {
  const styles = useChatsStyles();
  const { theme } = useAppTheme();
  const userId = useUserStore((state) => state.user?.id);
  const conversations = useChatStore((state) => state.conversations);
  const query = useConversations();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [query]);

  const renderConversation: ListRenderItem<Conversation> = ({ item }) => {
    const participant = getOtherParticipant(item, userId);
    return (
      <ConversationRow
        conversation={item}
        participant={participant}
        onOpenProfile={() => {
          if (!participant?.id) return;
          router.push({ pathname: '/profile/[id]', params: { id: participant.id } });
        }}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
      />
    );
  };

  const emptyContent = (() => {
    if (query.isPending) {
      return (
        <View style={styles.skeletonList}>
          {Array.from({ length: 6 }, (_, index) => (
            <ConversationSkeleton key={index} />
          ))}
        </View>
      );
    }

    if (query.isError) {
      return (
        <View style={styles.stateCard}>
          <View style={styles.stateIcon}>
            <SymbolView
              name={{ ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }}
              size={27}
              tintColor={styles.stateIconColor.color}
            />
          </View>
          <ThemedText type="bold" style={styles.stateTitle}>
            Couldn&apos;t load chats
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
            {query.error instanceof Error ? query.error.message : 'Please try again.'}
          </ThemedText>
          <Pressable onPress={() => void query.refetch()} style={styles.retryButton}>
            <ThemedText style={styles.retryText}>Try again</ThemedText>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.stateCard}>
        <View style={styles.stateIcon}>
          <SymbolView
            name={{
              ios: 'bubble.left.and.bubble.right',
              android: 'chat_bubble_outline',
              web: 'chat_bubble_outline',
            }}
            size={29}
            tintColor={styles.stateIconColor.color}
          />
        </View>
        <ThemedText type="bold" style={styles.stateTitle}>
          No conversations yet
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
          Find a language partner in Discover!
        </ThemedText>
        <Pressable onPress={() => router.push('/(tabs)/discover')} style={styles.retryButton}>
          <ThemedText style={styles.retryText}>Open Discover</ThemedText>
        </Pressable>
      </View>
    );
  })();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <View>
                <ThemedText type="title" style={styles.title}>
                  Chats
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  Keep the conversation going
                </ThemedText>
              </View>
              <View style={styles.headerBadge}>
                <SymbolView
                  name={{
                    ios: 'bubble.left.and.bubble.right.fill',
                    android: 'chat',
                    web: 'chat',
                  }}
                  size={22}
                  tintColor="#FFFFFF"
                />
              </View>
            </View>
          }
          ListEmptyComponent={emptyContent}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void refresh()}
              tintColor={theme === 'dark' ? '#B8A9FF' : '#6654C7'}
            />
          }
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
