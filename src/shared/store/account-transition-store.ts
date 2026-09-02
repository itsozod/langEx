import { create } from 'zustand';

type AccountTransitionState = {
  targetAccountId: string | null;
  begin: (targetAccountId: string) => void;
  finish: () => void;
};

export const useAccountTransitionStore = create<AccountTransitionState>()((set) => ({
  targetAccountId: null,
  begin: (targetAccountId) => set({ targetAccountId }),
  finish: () => set({ targetAccountId: null }),
}));
