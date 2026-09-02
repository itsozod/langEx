import { queryClient } from '@/providers/query-provider';
import type { AuthUser } from '@/screens/auth/types';
import { useOutboxStore } from '@/screens/chat/store/outbox-store';
import { socket } from '@/shared/lib/socket';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chat-store';
import { useOnboardingStore } from '@/shared/store/onboarding-store';
import { useAccountTransitionStore } from '@/shared/store/account-transition-store';
import { useUserStore } from '@/shared/store/user.store';
import { unstable_batchedUpdates } from 'react-native';

async function resetAccountScopedState() {
  await queryClient.cancelQueries();
  socket.disconnect();
  queryClient.clear();
  useChatStore.getState().reset();
  useOnboardingStore.getState().reset();
}

function onboardingReturnAccountId(previousAccountId: string | null, isProfileComplete: boolean) {
  return previousAccountId && !isProfileComplete ? previousAccountId : null;
}

function removeAccountAndActivateFallback(userId: string) {
  const auth = useAuthStore.getState();
  const users = useUserStore.getState().users;
  const remainingAccounts = auth.accounts.filter((account) => account.userId !== userId);
  const nextAccount = remainingAccounts.find(
    (account) => users.find((user) => user.id === account.userId)?.isProfileComplete,
  );

  auth.removeAccount(userId);
  if (nextAccount) useAuthStore.getState().switchAccount(nextAccount.userId);
  useUserStore.getState().removeUser(userId);
  if (nextAccount) useUserStore.getState().activateUser(nextAccount.userId);
}

export async function activateAuthenticatedSession(token: string, user: AuthUser) {
  const previousAccountId = useAuthStore.getState().activeAccountId;
  await resetAccountScopedState();
  unstable_batchedUpdates(() => {
    useOnboardingStore
      .getState()
      .setReturnAccountId(onboardingReturnAccountId(previousAccountId, user.isProfileComplete));
    useUserStore.getState().setUser(user);
    useAuthStore.getState().setSession(token, user.id);
  });
}

export async function switchToSavedAccount(userId: string) {
  const state = useAuthStore.getState();
  if (state.activeAccountId === userId) return true;
  if (!state.accounts.some((account) => account.userId === userId)) return false;
  const targetUser = useUserStore.getState().users.find((user) => user.id === userId);
  if (!targetUser) return false;

  const transition = useAccountTransitionStore.getState();
  transition.begin(userId);

  try {
    await Promise.all([
      resetAccountScopedState(),
      new Promise<void>((resolve) => setTimeout(resolve, 520)),
    ]);
    unstable_batchedUpdates(() => {
      useOnboardingStore
        .getState()
        .setReturnAccountId(
          onboardingReturnAccountId(state.activeAccountId, targetUser.isProfileComplete),
        );
      // Clearing queries wakes mounted observers. While the transition overlay is showing, the
      // previous account's conversations request can finish and repopulate the live Zustand list.
      // Reset again in the same commit as account activation so no previous-account row can render
      // under the new session while its account-keyed query is loading.
      useChatStore.getState().reset();
      useUserStore.getState().activateUser(userId);
      useAuthStore.getState().switchAccount(userId);
    });

    await new Promise<void>((resolve) => setTimeout(resolve, 180));
    return (
      useAuthStore.getState().activeAccountId === userId &&
      useUserStore.getState().activeUserId === userId
    );
  } finally {
    useAccountTransitionStore.getState().finish();
  }
}

export async function removeActiveAccount() {
  const userId = useAuthStore.getState().activeAccountId;
  await resetAccountScopedState();
  if (userId) useOutboxStore.getState().clearUser(userId);
  if (userId) {
    unstable_batchedUpdates(() => removeAccountAndActivateFallback(userId));
  }
}

export async function removeInvalidActiveAccount() {
  const userId = useAuthStore.getState().activeAccountId;
  await resetAccountScopedState();
  if (userId) {
    unstable_batchedUpdates(() => removeAccountAndActivateFallback(userId));
  }
}
