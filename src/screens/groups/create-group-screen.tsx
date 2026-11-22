import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, TextInput, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { useActionToast } from '@/shared/components/ui/action-toast-provider';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { GroupAvatar } from './components/group-avatar';
import { GroupListState } from './components/group-list-state';
import { GroupPersonRow } from './components/group-person-row';
import { GroupScreenHeader } from './components/group-screen-header';
import { useCreateGroup, useGroupCandidates } from './hooks';
import { useGroupStyles } from './styles/group-styles';
import type { GroupCandidate } from './types';
import { getGroupNameError, normalizeGroupName } from './utils/group-name';
import { useTranslation } from 'react-i18next';
import { translateMessage } from '@/shared/i18n/translate-message';

const MAX_SELECTED_PARTICIPANTS = 49;

export default function CreateGroupScreen() {
  const styles = useGroupStyles();
  const { t } = useTranslation(['groups', 'common']);
  const candidatesQuery = useGroupCandidates();
  const createGroup = useCreateGroup();
  const { showToast } = useActionToast();
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
          showToast({ message: t('feedback.created') });
          router.replace({ pathname: '/chat/[id]', params: { id: conversation.id } });
        },
        onError: () => {
          if (process.env.EXPO_OS === 'ios') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        },
      },
    );
  }, [canSubmit, createGroup, name, selectedIds, showToast, t]);

  const listHeader = (
    <View>
      <View style={styles.intro}>
        <GroupAvatar size="large" />
        <ThemedText type="bold" style={styles.introTitle}>
          {t('create.introTitle')}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.introMessage}>
          {t('create.introMessage')}
        </ThemedText>
      </View>
      <ThemedText type="bold" style={styles.fieldLabel}>
        {t('create.nameLabel')}
      </ThemedText>
      <TextInput
        accessibilityLabel={t('create.nameLabel')}
        autoCapitalize="sentences"
        autoCorrect
        enterKeyHint="done"
        onChangeText={(value) => {
          createGroup.reset();
          setName(value);
        }}
        onSubmitEditing={submit}
        placeholder={t('create.namePlaceholder')}
        placeholderTextColor={styles.disclosureIcon.color}
        returnKeyType="done"
        style={[styles.nameField, showNameError && nameError && styles.nameFieldError]}
        value={name}
      />
      <View style={styles.fieldFooter}>
        <ThemedText accessibilityLiveRegion="polite" style={styles.fieldError}>
          {showNameError && nameError ? translateMessage(t, nameError) : ''}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.counter}>
          {Array.from(normalizeGroupName(name)).length}/80
        </ThemedText>
      </View>
      {createGroup.error ? (
        <View accessibilityRole="alert" style={styles.inlineError}>
          <ThemedText selectable style={styles.inlineErrorText}>
            {createGroup.error instanceof Error ? createGroup.error.message : t('create.failed')}
          </ThemedText>
        </View>
      ) : null}
      {candidates.length > 0 && candidatesQuery.isError ? (
        <View accessibilityRole="alert" style={styles.inlineError}>
          <ThemedText selectable style={styles.inlineErrorText}>
            {t('peopleRefreshFailed')}
          </ThemedText>
        </View>
      ) : null}
      <View style={styles.sectionHeader}>
        <ThemedText type="bold" style={styles.sectionTitle}>
          {t('addPeople')}
        </ThemedText>
        <ThemedText style={styles.sectionCount}>
          {t('selectedOf', { count: selectedIds.size, total: MAX_SELECTED_PARTICIPANTS })}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <GroupScreenHeader
          actionDisabled={!canSubmit}
          actionLabel={t('create.action')}
          actionPending={createGroup.isPending}
          onAction={submit}
          onBack={() => router.back()}
          title={t('create.title')}
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
                message={t('create.loadingMessage')}
                title={t('create.loadingTitle')}
                type="loading"
              />
            ) : candidatesQuery.isError ? (
              <GroupListState
                message={
                  candidatesQuery.error instanceof Error
                    ? candidatesQuery.error.message
                    : t('common:errors.checkConnection')
                }
                onRetry={() => void candidatesQuery.refetch()}
                title={t('create.loadFailed')}
                type="error"
              />
            ) : (
              <GroupListState
                message={t('create.emptyMessage')}
                title={t('create.emptyTitle')}
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
