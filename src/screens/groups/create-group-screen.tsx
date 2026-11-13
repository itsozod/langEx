import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, TextInput, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { GroupAvatar } from './components/group-avatar';
import { GroupListState } from './components/group-list-state';
import { GroupPersonRow } from './components/group-person-row';
import { GroupScreenHeader } from './components/group-screen-header';
import { useCreateGroup, useGroupCandidates } from './hooks';
import { useGroupStyles } from './styles/group-styles';
import type { GroupCandidate } from './types';
import { getGroupNameError, normalizeGroupName } from './utils/group-name';

const MAX_SELECTED_PARTICIPANTS = 49;

export default function CreateGroupScreen() {
  const styles = useGroupStyles();
  const candidatesQuery = useGroupCandidates();
  const createGroup = useCreateGroup();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false);
  const nameError = getGroupNameError(name);
  const showNameError = didAttemptSubmit || Array.from(normalizeGroupName(name)).length > 80;
  const canSubmit = !nameError && selectedIds.size > 0 && !candidatesQuery.isPending;

  const candidates = useMemo(
    () =>
      [...(candidatesQuery.data?.candidates ?? [])].sort((first, second) =>
        (first.displayName ?? '').localeCompare(second.displayName ?? ''),
      ),
    [candidatesQuery.data?.candidates],
  );

  const toggleCandidate = useCallback(
    (candidateId: string) => {
      createGroup.reset();
      setSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(candidateId)) next.delete(candidateId);
        else if (next.size < MAX_SELECTED_PARTICIPANTS) next.add(candidateId);
        return next;
      });
    },
    [createGroup],
  );

  const renderCandidate = useCallback<ListRenderItem<GroupCandidate>>(
    ({ item }) => {
      const selected = selectedIds.has(item.id);
      return (
        <GroupPersonRow
          candidate={item}
          disabled={!selected && selectedIds.size >= MAX_SELECTED_PARTICIPANTS}
          onPress={() => toggleCandidate(item.id)}
          selected={selected}
          selectionMode
        />
      );
    },
    [selectedIds, toggleCandidate],
  );

  const submit = useCallback(() => {
    setDidAttemptSubmit(true);
    if (!canSubmit || createGroup.isPending) return;

    createGroup.mutate(
      { name: normalizeGroupName(name), participantIds: [...selectedIds] },
      {
        onSuccess: ({ conversation }) => {
          if (process.env.EXPO_OS === 'ios') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          router.replace({ pathname: '/chat/[id]', params: { id: conversation.id } });
        },
        onError: () => {
          if (process.env.EXPO_OS === 'ios') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        },
      },
    );
  }, [canSubmit, createGroup, name, selectedIds]);

  const listHeader = (
    <View>
      <View style={styles.intro}>
        <GroupAvatar size="large" />
        <ThemedText type="bold" style={styles.introTitle}>
          Bring your partners together
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.introMessage}>
          Choose people from your existing chats. You can add more later.
        </ThemedText>
      </View>
      <ThemedText type="bold" style={styles.fieldLabel}>
        Group name
      </ThemedText>
      <TextInput
        accessibilityLabel="Group name"
        autoCapitalize="sentences"
        autoCorrect
        enterKeyHint="done"
        onChangeText={(value) => {
          createGroup.reset();
          setName(value);
        }}
        onSubmitEditing={submit}
        placeholder="English practice"
        placeholderTextColor={styles.disclosureIcon.color}
        returnKeyType="done"
        style={[styles.nameField, showNameError && nameError && styles.nameFieldError]}
        value={name}
      />
      <View style={styles.fieldFooter}>
        <ThemedText accessibilityLiveRegion="polite" style={styles.fieldError}>
          {showNameError ? nameError : ''}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.counter}>
          {Array.from(normalizeGroupName(name)).length}/80
        </ThemedText>
      </View>
      {createGroup.error ? (
        <View accessibilityRole="alert" style={styles.inlineError}>
          <ThemedText selectable style={styles.inlineErrorText}>
            {createGroup.error instanceof Error
              ? createGroup.error.message
              : 'The group could not be created. Try again.'}
          </ThemedText>
        </View>
      ) : null}
      {candidates.length > 0 && candidatesQuery.isError ? (
        <View accessibilityRole="alert" style={styles.inlineError}>
          <ThemedText selectable style={styles.inlineErrorText}>
            People could not be refreshed. Showing the most recent list.
          </ThemedText>
        </View>
      ) : null}
      <View style={styles.sectionHeader}>
        <ThemedText type="bold" style={styles.sectionTitle}>
          Add people
        </ThemedText>
        <ThemedText style={styles.sectionCount}>
          {selectedIds.size}/{MAX_SELECTED_PARTICIPANTS} selected
        </ThemedText>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <GroupScreenHeader
          actionDisabled={!canSubmit}
          actionLabel="Create"
          actionPending={createGroup.isPending}
          onAction={submit}
          onBack={() => router.back()}
          title="New group"
        />
        <FlatList
          contentContainerStyle={styles.listContent}
          data={candidates}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          keyboardDismissMode={process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="always"
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            candidatesQuery.isPending ? (
              <GroupListState
                message="Loading people from your conversations."
                title="Finding partners…"
                type="loading"
              />
            ) : candidatesQuery.isError ? (
              <GroupListState
                message={
                  candidatesQuery.error instanceof Error
                    ? candidatesQuery.error.message
                    : 'Please check your connection.'
                }
                onRetry={() => void candidatesQuery.refetch()}
                title="Couldn’t load people"
                type="error"
              />
            ) : (
              <GroupListState
                message="Start a direct conversation first, then return here to create a group."
                title="No one to add yet"
                type="empty"
              />
            )
          }
          ListHeaderComponent={listHeader}
          renderItem={renderCandidate}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
