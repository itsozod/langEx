import { BottomSheet, RNHostView } from '@expo/ui';
import { preferredColorScheme } from '@expo/ui/swift-ui/modifiers';
import { ActivityIndicator, Pressable, useWindowDimensions, View } from 'react-native';

import type { ChatParticipant } from '@/screens/chat/types/message.types';
import { SymbolView, type SymbolViewProps } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useGroupManagementStyles } from '../styles/group-management-styles';
import type { GroupManagementAction, GroupRole } from '../types';

type GroupMemberActionsSheetProps = {
  adminLimitReached: boolean;
  errorMessage?: string;
  isPresented: boolean;
  member: ChatParticipant | null;
  onDismiss: () => void;
  onPromote: () => void;
  onRemove: () => void;
  onRevoke: () => void;
  onTransfer: () => void;
  onViewProfile: () => void;
  pendingAction?: GroupManagementAction;
  role: GroupRole;
  viewerRole: GroupRole;
};

export function GroupMemberActionsSheet({
  adminLimitReached,
  errorMessage,
  isPresented,
  member,
  onDismiss,
  onPromote,
  onRemove,
  onRevoke,
  onTransfer,
  onViewProfile,
  pendingAction,
  role,
  viewerRole,
}: GroupMemberActionsSheetProps) {
  const { colorScheme, containerColor, styles } = useGroupManagementStyles();
  const { width: windowWidth } = useWindowDimensions();
  const name = member?.displayName?.trim() || 'Group member';
  const isPending = Boolean(pendingAction);
  const canChangeAdmin = viewerRole === 'owner' && role !== 'owner';
  const canRemove = role !== 'owner' && (viewerRole === 'owner' || viewerRole === 'admin');
  const sheetModifiers =
    process.env.EXPO_OS === 'ios' ? [preferredColorScheme(colorScheme)] : undefined;

  return (
    <BottomSheet
      containerColor={containerColor}
      contentPadding={0}
      isPresented={isPresented}
      modifiers={sheetModifiers}
      onDismiss={onDismiss}>
      <RNHostView matchContents>
        <View style={[styles.sheetContent, { width: Math.min(windowWidth, 600) }]}>
          <View style={styles.sheetHeader}>
            <ThemedText type="bold" numberOfLines={2} style={styles.sheetTitle}>
              {name}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.sheetSubtitle}>
              {role === 'admin' ? 'Group admin' : 'Group member'}
            </ThemedText>
          </View>
          {errorMessage ? (
            <View accessibilityRole="alert" style={styles.error}>
              <ThemedText selectable style={styles.errorText}>
                {errorMessage}
              </ThemedText>
            </View>
          ) : null}
          <ActionButton
            action="profile"
            disabled={isPending}
            icon={{ ios: 'person.crop.circle', android: 'person', web: 'person' }}
            label="View profile"
            onPress={onViewProfile}
            pendingAction={pendingAction}
          />
          {canChangeAdmin && role === 'admin' ? (
            <ActionButton
              action="revoke"
              disabled={isPending}
              icon={{ ios: 'shield.slash', android: 'shield_person', web: 'shield_person' }}
              label="Remove admin role"
              onPress={onRevoke}
              pendingAction={pendingAction}
            />
          ) : null}
          {canChangeAdmin && role === 'member' ? (
            <ActionButton
              action="promote"
              disabled={isPending || adminLimitReached}
              icon={{
                ios: 'checkmark.shield.fill',
                android: 'verified_user',
                web: 'verified_user',
              }}
              label={adminLimitReached ? 'Admin limit reached' : 'Make admin'}
              onPress={onPromote}
              pendingAction={pendingAction}
            />
          ) : null}
          {viewerRole === 'owner' && role !== 'owner' ? (
            <ActionButton
              action="transfer"
              disabled={isPending}
              icon={{ ios: 'crown.fill', android: 'crown', web: 'crown' }}
              label="Transfer ownership"
              onPress={onTransfer}
              pendingAction={pendingAction}
            />
          ) : null}
          {canRemove ? (
            <ActionButton
              action="remove"
              danger
              disabled={isPending}
              icon={{ ios: 'person.badge.minus', android: 'person_remove', web: 'person_remove' }}
              label="Remove from group"
              onPress={onRemove}
              pendingAction={pendingAction}
            />
          ) : null}
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

type ActionButtonProps = {
  action: GroupManagementAction;
  danger?: boolean;
  disabled: boolean;
  icon: SymbolViewProps['name'];
  label: string;
  onPress: () => void;
  pendingAction?: GroupManagementAction;
};

function ActionButton({
  action,
  danger,
  disabled,
  icon,
  label,
  onPress,
  pendingAction,
}: ActionButtonProps) {
  const { styles } = useGroupManagementStyles();
  const isPending = pendingAction === action;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: isPending, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        disabled && styles.actionButtonDisabled,
        pressed && styles.actionButtonPressed,
      ]}>
      <View style={[styles.actionIcon, danger && styles.actionIconDanger]}>
        <SymbolView
          name={icon}
          size={20}
          weight="semibold"
          tintColor={danger ? styles.dangerIcon.color : styles.actionIconColor.color}
        />
      </View>
      <ThemedText type="bold" style={[styles.actionLabel, danger && styles.actionLabelDanger]}>
        {label}
      </ThemedText>
      {isPending ? (
        <ActivityIndicator
          size="small"
          color={danger ? styles.dangerIcon.color : styles.actionIconColor.color}
          style={styles.actionSpinner}
        />
      ) : null}
    </Pressable>
  );
}
