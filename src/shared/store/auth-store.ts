import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

const LEGACY_SESSION_KEY = 'langex-auth-session';

export type SavedAccountCredentials = {
  userId: string;
  token: string;
};

type AuthState = {
  accounts: SavedAccountCredentials[];
  activeAccountId: string | null;
  token: string | null;
  setSession: (token: string, userId: string) => void;
  switchAccount: (userId: string) => void;
  removeAccount: (userId: string) => void;
};

type PersistedAuthState = Pick<AuthState, 'accounts' | 'activeAccountId'>;

function withoutAccount(accounts: SavedAccountCredentials[], userId: string) {
  return accounts.filter((account) => account.userId !== userId);
}

function activate(
  accounts: SavedAccountCredentials[],
  account: SavedAccountCredentials | undefined,
) {
  return {
    accounts,
    activeAccountId: account?.userId ?? null,
    token: account?.token ?? null,
  };
}

const authStorage: StateStorage = {
  getItem: async (name) => {
    const current = await AsyncStorage.getItem(name);
    if (current) return current;

    const legacyValue = await AsyncStorage.getItem(LEGACY_SESSION_KEY);
    if (!legacyValue) return null;

    try {
      const legacy = JSON.parse(legacyValue) as {
        state?: {
          accounts?: { token?: unknown; user?: { id?: unknown } }[];
          activeAccountId?: unknown;
          token?: unknown;
          user?: { id?: unknown };
        };
      };
      const state = legacy.state;
      const accounts = (state?.accounts ?? [])
        .filter(
          (account): account is { token: string; user: { id: string } } =>
            typeof account.token === 'string' && typeof account.user?.id === 'string',
        )
        .map((account) => ({ token: account.token, userId: account.user.id }));

      if (
        !accounts.length &&
        typeof state?.token === 'string' &&
        typeof state.user?.id === 'string'
      ) {
        accounts.push({ token: state.token, userId: state.user.id });
      }

      return JSON.stringify({
        state: {
          accounts,
          activeAccountId:
            typeof state?.activeAccountId === 'string'
              ? state.activeAccountId
              : (accounts[0]?.userId ?? null),
        },
        version: 1,
      });
    } catch {
      return null;
    }
  },
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accounts: [],
      activeAccountId: null,
      token: null,
      setSession: (token, userId) =>
        set((state) => {
          const account = { token, userId };
          return activate([account, ...withoutAccount(state.accounts, userId)], account);
        }),
      switchAccount: (userId) =>
        set((state) => {
          const account = state.accounts.find((item) => item.userId === userId);
          return account ? activate(state.accounts, account) : state;
        }),
      removeAccount: (userId) =>
        set((state) => {
          const accounts = withoutAccount(state.accounts, userId);
          if (state.activeAccountId !== userId) return { accounts };
          return activate(accounts, undefined);
        }),
    }),
    {
      name: 'langex-auth-credentials',
      version: 1,
      storage: createJSONStorage(() => authStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PersistedAuthState> | undefined;
        const accounts = Array.isArray(persisted?.accounts) ? persisted.accounts : [];
        const hasPersistedActiveAccount =
          persisted !== undefined &&
          Object.prototype.hasOwnProperty.call(persisted, 'activeAccountId');
        const activeAccount = hasPersistedActiveAccount
          ? accounts.find((account) => account.userId === persisted.activeAccountId)
          : accounts[0];

        return { ...currentState, ...activate(accounts, activeAccount) };
      },
      partialize: ({ accounts, activeAccountId }) => ({ accounts, activeAccountId }),
    },
  ),
);

export function useAuthHydration() {
  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribeHydrate = useAuthStore.persist.onHydrate(() => setHasHydrated(false));
    const unsubscribeFinish = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(useAuthStore.persist.hasHydrated());

    return () => {
      unsubscribeHydrate();
      unsubscribeFinish();
    };
  }, []);

  return hasHydrated;
}
