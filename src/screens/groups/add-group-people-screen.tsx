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
import { useTranslation } from 'react-i18next';

export default function AddGroupPeopleScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const conversationId = firstParam(params.id);
  const styles = useGroupStyles();
  const { t } = useTranslation('groups');
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
          actionLabel={t('add.action')}
          actionPending={addParticipants.isPending}
          onAction={submit}
          onBack={() => router.back()}
          title={t('addPeople')}
        />
        <FlatList
          contentContainerStyle={styles.listContent}
          data={canManage ? candidates : []}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            isLoading ? (
              <GroupListState
                message={t('add.loadingMessage')}
                title={t('add.loadingTitle')}
                type="loading"
              />
            ) : error || !conversation ? (
              <GroupListState
                message={error instanceof Error ? error.message : t('add.loadFailedMessage')}
                onRetry={() => {
                  void conversationQuery.refetch();
                  void candidatesQuery.refetch();
                }}
                title={t('loadGroupFailed')}
                type="error"
              />
            ) : hasInvalidAccess ? (
              <GroupListState
                message={t('add.noAccessMessage')}
                title={t('add.noAccessTitle')}
                type="empty"
              />
            ) : remainingSlots === 0 ? (
              <GroupListState
                message={t('add.fullMessage', { limit: 50 })}
                title={t('add.fullTitle')}
                type="empty"
              />
            ) : (
              <GroupListState
                message={t('add.emptyMessage')}
                title={t('add.emptyTitle')}
                type="empty"
              />
            )
          }
          ListHeaderComponent={
            candidates.length || addParticipants.error ? (
              <View>
                <View style={styles.sectionHeader}>
                  <ThemedText type="bold" style={styles.sectionTitle}>
                    {t('add.available')}
                  </ThemedText>
                  <ThemedText style={styles.sectionCount}>
                    {t('selectedOf', { count: selectedIds.size, total: remainingSlots })}
                  </ThemedText>
                </View>
                {addParticipants.error || error ? (
                  <View accessibilityRole="alert" style={styles.inlineError}>
                    <ThemedText selectable style={styles.inlineErrorText}>
                      {addParticipants.error instanceof Error
                        ? addParticipants.error.message
                        : error
                          ? t('peopleRefreshFailed')
                          : t('add.failed')}
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
