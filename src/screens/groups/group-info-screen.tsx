import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useConversation } from '@/screens/chat/hooks';
import type { ChatParticipant } from '@/screens/chat/types/message.types';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useUserStore } from '@/shared/store/user.store';

import { GroupAvatar } from './components/group-avatar';
import { GroupListState } from './components/group-list-state';
import { GroupMemberActionsSheet } from './components/group-member-actions-sheet';
import { GroupPersonRow } from './components/group-person-row';
import { GroupScreenHeader } from './components/group-screen-header';
import { useGroupManagementActions } from './hooks/use-group-management-actions';
import { useGroupManagementStyles } from './styles/group-management-styles';
import { useGroupStyles } from './styles/group-styles';
import type { GroupRole } from './types';

export default function GroupInfoScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const conversationId = firstParam(params.id);
  const styles = useGroupStyles();
  const { styles: managementStyles } = useGroupManagementStyles();
  const currentUserId = useUserStore((state) => state.user?.id);
  const query = useConversation(conversationId);
  const conversation = query.data?.pages[0]?.conversation;
  const adminIds = useMemo(() => conversation?.adminIds ?? [], [conversation?.adminIds]);
  const [selectedMember, setSelectedMember] = useState<ChatParticipant | null>(null);
  const participants = useMemo(
    () =>
      [...(conversation?.participants ?? [])].sort((first, second) => {
        if (first.id === conversation?.createdById) return -1;
        if (second.id === conversation?.createdById) return 1;
        return (first.displayName ?? '').localeCompare(second.displayName ?? '');
      }),
    [conversation?.createdById, conversation?.participants],
  );
  const viewerRole = getGroupRole(conversation?.createdById, adminIds, currentUserId);
  const canAddPeople = Boolean(
    (viewerRole === 'owner' || viewerRole === 'admin') &&
    participants.length < 50 &&
    !conversation?.isReadOnly,
  );
  const closeMemberActions = useCallback(() => setSelectedMember(null), []);
  const management = useGroupManagementActions({
    conversationId,
    groupName: conversation?.name,
    member: selectedMember,
    onMemberActionComplete: closeMemberActions,
  });
  const resetManagement = management.reset;
  const selectedMemberRole = getGroupRole(conversation?.createdById, adminIds, selectedMember?.id);

  const openMemberActions = useCallback(
    (member: ChatParticipant) => {
      resetManagement();
      setSelectedMember(member);
    },
    [resetManagement],
  );

  const renderParticipant = useCallback<ListRenderItem<ChatParticipant>>(
    ({ item }) => {
      const role = getGroupRole(conversation?.createdById, adminIds, item.id);
      const isCurrentUser = item.id === currentUserId;
      const canManage =
        !isCurrentUser &&
        !item.isDeleted &&
        (viewerRole === 'owner' || (viewerRole === 'admin' && role !== 'owner'));
      const roleLabel = isCurrentUser
        ? role === 'owner'
          ? 'You · Owner'
          : role === 'admin'
            ? 'You · Admin'
            : 'You'
        : role === 'owner'
          ? 'Owner'
          : role === 'admin'
            ? 'Admin'
            : 'Member';

      return (
        <GroupPersonRow
          candidate={item}
          disabled={item.isDeleted}
          onManage={canManage ? () => openMemberActions(item) : undefined}
          onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.id } })}
          roleLabel={roleLabel}
        />
      );
    },
    [adminIds, conversation?.createdById, currentUserId, openMemberActions, viewerRole],
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <GroupScreenHeader onBack={() => router.back()} title="Group info" />
        <FlatList
          contentContainerStyle={styles.listContent}
          data={participants}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            query.isPending ? (
              <GroupListState
                message="Loading the group’s members."
                title="Loading group…"
                type="loading"
              />
            ) : (
              <GroupListState
                message={
                  query.error instanceof Error
                    ? query.error.message
                    : 'This group is no longer available.'
                }
                onRetry={() => void query.refetch()}
                title="Couldn’t load the group"
                type="error"
              />
            )
          }
          ListHeaderComponent={
            conversation ? (
              <View>
                <View style={styles.intro}>
                  <GroupAvatar size="large" />
                  <ThemedText type="bold" style={styles.introTitle}>
                    {conversation.name?.trim() || 'Group conversation'}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.memberSummary}>
                    {participants.length} {participants.length === 1 ? 'member' : 'members'}
                  </ThemedText>
                </View>
                {canAddPeople ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/group/[id]/add-people',
                        params: { id: conversation.id },
                      })
                    }
                    style={({ pressed }) => [styles.addPeopleButton, pressed && styles.pressed]}>
                    <SymbolView
                      name={{ ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }}
                      size={21}
                      weight="semibold"
                      tintColor="#FFFFFF"
                    />
                    <ThemedText type="bold" style={styles.addPeopleText}>
                      Add people
                    </ThemedText>
                  </Pressable>
                ) : null}
                {query.isError ? (
                  <View accessibilityRole="alert" style={styles.inlineError}>
                    <ThemedText selectable style={styles.inlineErrorText}>
                      Group details could not be refreshed. Showing saved information.
                    </ThemedText>
                  </View>
                ) : null}
                <View style={styles.sectionHeader}>
                  <ThemedText type="bold" style={styles.sectionTitle}>
                    Members
                  </ThemedText>
                  <ThemedText style={styles.sectionCount}>{participants.length}/50</ThemedText>
                </View>
              </View>
            ) : null
          }
          ListFooterComponent={
            conversation ? (
              <View style={managementStyles.leaveSection}>
                {management.leaveErrorMessage ? (
                  <View accessibilityRole="alert" style={managementStyles.error}>
                    <ThemedText selectable style={managementStyles.errorText}>
                      {management.leaveErrorMessage}
                    </ThemedText>
                  </View>
                ) : null}
                {viewerRole === 'owner' ? (
                  <ThemedText themeColor="textSecondary" style={managementStyles.ownerNotice}>
                    Transfer ownership to another member before leaving this group.
                  </ThemedText>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ busy: management.isPending }}
                    disabled={management.isPending}
                    onPress={management.leave}
                    style={({ pressed }) => [
                      managementStyles.leaveButton,
                      pressed && managementStyles.actionButtonPressed,
                    ]}>
                    {management.isPending ? (
                      <ActivityIndicator size="small" color={managementStyles.dangerIcon.color} />
                    ) : (
                      <SymbolView
                        name={{
                          ios: 'rectangle.portrait.and.arrow.right',
                          android: 'logout',
                          web: 'logout',
                        }}
                        size={20}
                        weight="semibold"
                        tintColor={managementStyles.dangerIcon.color}
                      />
                    )}
                    <ThemedText type="bold" style={managementStyles.leaveText}>
                      Leave group
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            ) : null
          }
          renderItem={renderParticipant}
          showsVerticalScrollIndicator={false}
        />
        <GroupMemberActionsSheet
          adminLimitReached={adminIds.length >= 3}
          errorMessage={selectedMember ? management.errorMessage : undefined}
          isPresented={Boolean(selectedMember)}
          member={selectedMember}
          onDismiss={() => {
            if (!management.isPending) closeMemberActions();
          }}
          onPromote={management.promote}
          onRemove={management.remove}
          onRevoke={management.revoke}
          onTransfer={management.transfer}
          onViewProfile={() => {
            if (!selectedMember) return;
            const memberId = selectedMember.id;
            closeMemberActions();
            router.push({ pathname: '/profile/[id]', params: { id: memberId } });
          }}
          pendingAction={management.pendingAction}
          role={selectedMemberRole}
          viewerRole={viewerRole}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

function getGroupRole(
  ownerId: string | null | undefined,
  adminIds: string[],
  userId: string | undefined,
): GroupRole {
  if (userId && userId === ownerId) return 'owner';
  if (userId && adminIds.includes(userId)) return 'admin';
  return 'member';
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
