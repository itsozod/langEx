import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { useConversations } from '@/screens/chat/hooks';
import type { ChatParticipant, Conversation } from '@/screens/chat/types';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chatStore';

function initials(name?: string | null) {
  const value = name?.trim() || 'Language partner';
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatTimestamp(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return isToday
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
      });
}

function getOtherParticipant(conversation: Conversation, currentUserId?: string) {
  return (
    conversation.participants.find((participant) => participant.id !== currentUserId) ??
    conversation.participants[0]
  );
}

export default function Chats() {
  const styles = useStyles();
  const { theme } = useAppTheme();
  const userId = useAuthStore((state) => state.user?.id);
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

function ConversationRow({
  conversation,
  participant,
  onOpenProfile,
  onPress,
}: {
  conversation: Conversation;
  participant?: ChatParticipant;
  onOpenProfile: () => void;
  onPress: () => void;
}) {
  const styles = useStyles();
  const name = participant?.displayName?.trim() || 'Language partner';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${name}'s profile`}
        disabled={!participant?.id}
        hitSlop={5}
        onPress={(event) => {
          event.stopPropagation();
          onOpenProfile();
        }}
        style={({ pressed }) => [styles.avatarWrap, pressed && styles.avatarPressed]}>
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
          <View pointerEvents="none" style={styles.countryBadge}>
            <CountryFlag country={participant.country} size={14} boxSize={19} />
          </View>
        ) : null}
      </Pressable>

      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <ThemedText type="bold" numberOfLines={1} style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.timestamp}>
            {formatTimestamp(conversation.lastMessageTimestamp)}
          </ThemedText>
        </View>
        <View style={styles.rowBottom}>
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.preview}>
            {conversation.lastMessagePreview || 'Start the conversation'}
          </ThemedText>
          {typeof conversation.unreadCount === 'number' && conversation.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadText}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function ConversationSkeleton() {
  const styles = useStyles();
  return (
    <View style={styles.skeletonRow}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonCopy}>
        <View style={styles.skeletonName} />
        <View style={styles.skeletonPreview} />
      </View>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const card = isDark ? 'rgba(38,32,52,0.94)' : 'rgba(255,255,255,0.92)';
  const border = isDark ? 'rgba(190,176,255,0.12)' : 'rgba(97,76,190,0.09)';
  const skeleton = isDark ? '#332D42' : '#EAE6F0';

  return StyleSheet.create({
    safeArea: { flex: 1, width: '100%' },
    content: {
      flexGrow: 1,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingBottom: 120,
    },
    header: {
      paddingTop: 16,
      paddingBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: { fontSize: 32, lineHeight: 39 },
    subtitle: { fontSize: 13, lineHeight: 20, marginTop: 3 },
    headerBadge: {
      width: 46,
      height: 46,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6B57CA',
    },
    row: {
      minHeight: 82,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 13,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },
    pressed: { opacity: 0.72, transform: [{ scale: 0.995 }] },
    avatarWrap: { width: 54, height: 54 },
    avatarPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
    avatar: { width: 54, height: 54, borderRadius: 27 },
    avatarPlaceholder: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#55488A' : '#E8E2FF',
    },
    countryBadge: {
      position: 'absolute',
      right: -3,
      bottom: -2,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? '#262034' : '#FFFFFF',
      backgroundColor: isDark ? '#302A3E' : '#FFFFFF',
    },
    initials: { color: isDark ? '#F2EEFF' : '#5846AA', fontSize: 16, lineHeight: 21 },
    rowCopy: { flex: 1, minWidth: 0, gap: 6 },
    rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    name: { flex: 1, fontSize: 15, lineHeight: 20 },
    timestamp: { fontSize: 10, lineHeight: 14 },
    preview: { flex: 1, fontSize: 12, lineHeight: 17 },
    unreadBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6B57CA',
    },
    unreadText: { color: '#FFFFFF', fontSize: 9, lineHeight: 12, fontWeight: '700' },
    separator: { height: 10 },
    stateCard: {
      marginTop: 50,
      alignItems: 'center',
      borderRadius: 24,
      paddingHorizontal: 26,
      paddingVertical: 38,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },
    stateIcon: {
      width: 58,
      height: 58,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      backgroundColor: isDark ? 'rgba(130,108,235,0.15)' : '#F0EBFF',
    },
    stateIconColor: { color: isDark ? '#B9ABFF' : '#6654C7' },
    stateTitle: { fontSize: 17, lineHeight: 23, marginBottom: 7 },
    stateMessage: { textAlign: 'center', fontSize: 13, lineHeight: 20 },
    retryButton: {
      marginTop: 18,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 10,
      backgroundColor: '#6654C7',
    },
    retryText: { color: '#FFFFFF', fontSize: 12, lineHeight: 17, fontWeight: '700' },
    skeletonList: { gap: 10 },
    skeletonRow: {
      minHeight: 82,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      borderRadius: 20,
      padding: 14,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },
    skeletonAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: skeleton },
    skeletonCopy: { flex: 1, gap: 10 },
    skeletonName: { width: '43%', height: 13, borderRadius: 7, backgroundColor: skeleton },
    skeletonPreview: { width: '78%', height: 10, borderRadius: 6, backgroundColor: skeleton },
  });
};
