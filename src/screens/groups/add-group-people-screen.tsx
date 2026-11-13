import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useConversation } from '@/screens/chat/hooks';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useUserStore } from '@/shared/store/user.store';

import { GroupListState } from './components/group-list-state';
import { GroupPersonRow } from './components/group-person-row';
import { GroupScreenHeader } from './components/group-screen-header';
import { useAddGroupParticipants, useGroupCandidates } from './hooks';
import { useGroupStyles } from './styles/group-styles';
import type { GroupCandidate } from './types';

export default function AddGroupPeopleScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const conversationId = firstParam(params.id);
  const styles = useGroupStyles();
  const currentUserId = useUserStore((state) => state.user?.id);
  const conversationQuery = useConversation(conversationId);
  const candidatesQuery = useGroupCandidates();
  const addParticipants = useAddGroupParticipants();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const conversation = conversationQuery.data?.pages[0]?.conversation;
  const existingIds = useMemo(
    () => new Set(conversation?.participants.map((participant) => participant.id) ?? []),
    [conversation?.participants],
  );
  const remainingSlots = Math.max(0, 50 - (conversation?.participants.length ?? 50));
  const canManage = Boolean(
    conversation &&
    (conversation.createdById === currentUserId ||
      conversation.adminIds?.includes(currentUserId ?? '')),
  );
  const candidates = useMemo(
    () =>
      [...(candidatesQuery.data?.candidates ?? [])]
        .filter((candidate) => !existingIds.has(candidate.id))
        .sort((first, second) => (first.displayName ?? '').localeCompare(second.displayName ?? '')),
    [candidatesQuery.data?.candidates, existingIds],
  );

  const toggleCandidate = useCallback(
    (candidateId: string) => {
      addParticipants.reset();
      setSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(candidateId)) next.delete(candidateId);
        else if (next.size < remainingSlots) next.add(candidateId);
        return next;
      });
    },
    [addParticipants, remainingSlots],
  );

  const renderCandidate = useCallback<ListRenderItem<GroupCandidate>>(
    ({ item }) => {
      const selected = selectedIds.has(item.id);
      return (
        <GroupPersonRow
          candidate={item}
          disabled={!selected && selectedIds.size >= remainingSlots}
          onPress={() => toggleCandidate(item.id)}
          selected={selected}
          selectionMode
        />
      );
    },
    [remainingSlots, selectedIds, toggleCandidate],
  );

  const submit = useCallback(() => {
    if (!conversationId || !canManage || !selectedIds.size || addParticipants.isPending) return;

    addParticipants.mutate(
      { conversationId, participantIds: [...selectedIds] },
      {
        onSuccess: () => {
          if (process.env.EXPO_OS === 'ios') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          router.back();
        },
        onError: () => {
          if (process.env.EXPO_OS === 'ios') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        },
      },
    );
  }, [addParticipants, canManage, conversationId, selectedIds]);

  const isLoading = conversationQuery.isPending || candidatesQuery.isPending;
  const error = conversationQuery.error ?? candidatesQuery.error;
  const hasInvalidAccess = !isLoading && conversation && !canManage;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <GroupScreenHeader
          actionDisabled={!canManage || selectedIds.size === 0}
          actionLabel="Add"
          actionPending={addParticipants.isPending}
          onAction={submit}
          onBack={() => router.back()}
          title="Add people"
        />
        <FlatList
          contentContainerStyle={styles.listContent}
          data={canManage ? candidates : []}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            isLoading ? (
              <GroupListState
                message="Checking the group and your available conversations."
                title="Loading people…"
                type="loading"
              />
            ) : error || !conversation ? (
              <GroupListState
                message={error instanceof Error ? error.message : 'The group could not be loaded.'}
                onRetry={() => {
                  void conversationQuery.refetch();
                  void candidatesQuery.refetch();
                }}
                title="Couldn’t load the group"
                type="error"
              />
            ) : hasInvalidAccess ? (
              <GroupListState
                message="Only the group owner or an admin can add members."
                title="Manager access required"
                type="empty"
              />
            ) : remainingSlots === 0 ? (
              <GroupListState
                message="This group has reached the 50-member limit."
                title="The group is full"
                type="empty"
              />
            ) : (
              <GroupListState
                message="Everyone from your eligible direct chats is already in this group."
                title="No one else to add"
                type="empty"
              />
            )
          }
          ListHeaderComponent={
            candidates.length || addParticipants.error ? (
              <View>
                <View style={styles.sectionHeader}>
                  <ThemedText type="bold" style={styles.sectionTitle}>
                    Available partners
                  </ThemedText>
                  <ThemedText style={styles.sectionCount}>
                    {selectedIds.size}/{remainingSlots} selected
                  </ThemedText>
                </View>
                {addParticipants.error || error ? (
                  <View accessibilityRole="alert" style={styles.inlineError}>
                    <ThemedText selectable style={styles.inlineErrorText}>
                      {addParticipants.error instanceof Error
                        ? addParticipants.error.message
                        : error
                          ? 'People could not be refreshed. Showing the most recent list.'
                          : 'People could not be added. Try again.'}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            ) : null
          }
          renderItem={renderCandidate}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
