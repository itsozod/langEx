import { create } from 'zustand';

import type { SearchBarRect } from '@/shared/hooks/use-search-overlay-transition';

type UserSearchState = {
  isOpen: boolean;
  /** Where the Discover search bar was on screen when search opened (window coordinates). */
  origin: SearchBarRect | null;
  open: (origin: SearchBarRect | null) => void;
  close: () => void;
};

/**
 * Connects the Discover page trigger with the people search rendered above the tab bar. Opening a
 * profile from a result does not touch this state, so the search is still there on the way back.
 */
export const useUserSearchStore = create<UserSearchState>()((set) => ({
  isOpen: false,
  origin: null,
  open: (origin) => set({ isOpen: true, origin }),
  close: () => set({ isOpen: false }),
}));
