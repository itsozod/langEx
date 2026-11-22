import { BottomSheet, RNHostView } from '@expo/ui';
import { preferredColorScheme } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/shared/components/ui/themed-text';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';
import { translateMessage } from '@/shared/i18n/translate-message';

import { useGroupManagementStyles } from '../styles/group-management-styles';
import { getGroupNameError, normalizeGroupName } from '../utils/group-name';

type GroupNameEditSheetProps = {
  errorMessage?: string;
  isPending: boolean;
  name: string;
  onDismiss: () => void;
  onSave: (name: string) => Promise<void>;
  onStartEditing: () => void;
};

export function GroupNameEditSheet({
  errorMessage,
  isPending,
  name,
  onDismiss,
  onSave,
  onStartEditing,
}: GroupNameEditSheetProps) {
  const { t } = useTranslation(['groups', 'common']);
  const tokens = useUiTokens();
  const { colorScheme, containerColor } = useGroupManagementStyles();
  const { width: windowWidth } = useWindowDimensions();
  const [draft, setDraft] = useState(name);
  const [didAttemptSave, setDidAttemptSave] = useState(false);
  const validationError = getGroupNameError(draft);
  const normalizedDraft = normalizeGroupName(draft);
  const sheetModifiers =
    process.env.EXPO_OS === 'ios' ? [preferredColorScheme(colorScheme)] : undefined;

  const save = async () => {
    setDidAttemptSave(true);
    if (validationError || isPending) return;
    if (normalizedDraft === name) {
      onDismiss();
      return;
    }

    try {
      await onSave(normalizedDraft);
      onDismiss();
    } catch {
      // Keep the sheet and draft open so the user can recover from the request failure.
    }
  };

  return (
    <BottomSheet
      containerColor={containerColor}
      contentPadding={0}
      isPresented
      modifiers={sheetModifiers}
      onDismiss={onDismiss}>
      <RNHostView matchContents>
        <View style={[styles.content, { width: Math.min(windowWidth, 600) }]}>
          <View style={styles.header}>
            <ThemedText type="bold" style={styles.title}>
              {t('edit.title')}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {t('edit.message')}
            </ThemedText>
          </View>
          <TextInput
            accessibilityLabel={t('edit.nameLabel')}
            autoCapitalize="sentences"
            autoCorrect
            autoFocus
            editable={!isPending}
            maxLength={120}
            onChangeText={(value) => {
              setDraft(value);
              onStartEditing();
            }}
            onSubmitEditing={() => void save()}
            returnKeyType="done"
            selectTextOnFocus
            style={[
              styles.input,
              {
                backgroundColor: tokens.fill,
                borderColor: didAttemptSave && validationError ? tokens.danger : tokens.accent,
                color: tokens.text,
              },
            ]}
            value={draft}
          />
          <View style={styles.footer}>
            <ThemedText
              accessibilityLiveRegion="polite"
              style={[styles.error, { color: tokens.danger }]}>
              {didAttemptSave && validationError
                ? translateMessage(t, validationError)
                : (errorMessage ?? '')}
            </ThemedText>
            <ThemedText style={[styles.counter, { color: tokens.muted }]}>
              {Array.from(normalizedDraft).length}/80
            </ThemedText>
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isPending}
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: tokens.fill },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.cancelText, { color: tokens.text }]}>
                {t('common:actions.cancel')}
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: isPending }}
              disabled={isPending}
              onPress={() => void save()}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: tokens.accent },
                pressed && styles.pressed,
              ]}>
              {isPending ? (
                <ActivityIndicator color={tokens.onAccent} size="small" />
              ) : (
                <ThemedText style={[styles.saveText, { color: tokens.onAccent }]}>
                  {t('edit.save')}
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 10 },
  header: { alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingBottom: 6 },
  title: { fontFamily: FONT.bold, fontSize: 20, lineHeight: 26, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    fontFamily: FONT.regular,
    fontSize: 16,
  },
  footer: { minHeight: 22, flexDirection: 'row', alignItems: 'center', gap: 12 },
  error: { flex: 1, fontSize: 12, lineHeight: 17 },
  counter: { fontSize: 12, lineHeight: 17, fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 4 },
  actionButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  cancelText: { fontFamily: FONT.semibold, fontSize: 15 },
  saveText: { fontFamily: FONT.semibold, fontSize: 15 },
  pressed: { opacity: 0.62 },
});
