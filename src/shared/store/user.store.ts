import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import type { AuthUser } from '@/screens/auth/types';

const LEGACY_SESSION_KEY = 'langex-auth-session';

type UserState = {
  users: AuthUser[];
  activeUserId: string | null;
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  activateUser: (userId: string) => void;
  removeUser: (userId: string) => void;
};

type PersistedUserState = Pick<UserState, 'users' | 'activeUserId'>;

function withoutUser(users: AuthUser[], userId: string) {
  return users.filter((user) => user.id !== userId);
}

function activate(users: AuthUser[], userId: string | null) {
  const user = users.find((item) => item.id === userId) ?? null;
  return { users, activeUserId: user?.id ?? null, user };
}

const userStorage: StateStorage = {
  getItem: async (name) => {
    const current = await AsyncStorage.getItem(name);
    if (current) return current;

    const legacyValue = await AsyncStorage.getItem(LEGACY_SESSION_KEY);
    if (!legacyValue) return null;

    try {
      const legacy = JSON.parse(legacyValue) as {
        state?: {
          accounts?: { user?: AuthUser }[];
          activeAccountId?: unknown;
          user?: AuthUser;
        };
      };
      const state = legacy.state;
      const users = (state?.accounts ?? [])
        .map((account) => account.user)
        .filter((user): user is AuthUser => typeof user?.id === 'string');

      if (!users.length && typeof state?.user?.id === 'string') users.push(state.user);

      return JSON.stringify({
        state: {
          users,
          activeUserId:
            typeof state?.activeAccountId === 'string'
              ? state.activeAccountId
              : (users[0]?.id ?? null),
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

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: [],
      activeUserId: null,
      user: null,
      setUser: (user) =>
        set((state) => {
          const users = state.users.some((item) => item.id === user.id)
            ? state.users.map((item) => (item.id === user.id ? user : item))
            : [user, ...state.users];
          return activate(users, user.id);
        }),
      activateUser: (userId) =>
        set((state) =>
          state.users.some((user) => user.id === userId) ? activate(state.users, userId) : state,
        ),
      removeUser: (userId) =>
        set((state) => {
          const users = withoutUser(state.users, userId);
          return state.activeUserId === userId ? activate(users, null) : { users };
        }),
    }),
    {
      name: 'langex-users',
      version: 1,
      storage: createJSONStorage(() => userStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PersistedUserState> | undefined;
        const users = Array.isArray(persisted?.users) ? persisted.users : [];
        const hasPersistedActiveUser =
          persisted !== undefined &&
          Object.prototype.hasOwnProperty.call(persisted, 'activeUserId');
        return {
          ...currentState,
          ...activate(
            users,
            hasPersistedActiveUser ? (persisted.activeUserId ?? null) : (users[0]?.id ?? null),
          ),
        };
      },
      partialize: ({ users, activeUserId }) => ({ users, activeUserId }),
    },
  ),
);

export function useUserHydration() {
  const [hasHydrated, setHasHydrated] = useState(useUserStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribeHydrate = useUserStore.persist.onHydrate(() => setHasHydrated(false));
    const unsubscribeFinish = useUserStore.persist.onFinishHydration(() => setHasHydrated(true));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(useUserStore.persist.hasHydrated());

    return () => {
      unsubscribeHydrate();
      unsubscribeFinish();
    };
  }, []);

  return hasHydrated;
}
