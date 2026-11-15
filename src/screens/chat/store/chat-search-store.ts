import { create } from 'zustand';

import type { SearchBarRect } from '@/shared/hooks/use-search-overlay-transition';

type ChatSearchState = {
  isOpen: boolean;
  /** Where the Chats page search bar was on screen when search opened (window coordinates). */
  origin: SearchBarRect | null;
  open: (origin: SearchBarRect | null) => void;
  close: () => void;
};

/**
 * Connects the Chats page trigger with the search layer rendered above the tab bar. Opening a
 * chat or profile from a result does not touch this state, so the search is still there when the
 * user navigates back.
 */
export const useChatSearchStore = create<ChatSearchState>()((set) => ({
  isOpen: false,
  origin: null,
  open: (origin) => set({ isOpen: true, origin }),
  close: () => set({ isOpen: false }),
}));
