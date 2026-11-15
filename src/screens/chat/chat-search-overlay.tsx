import { useEffect } from 'react';

import { useUserStore } from '@/shared/store/user.store';

import { ChatSearchView } from './components/chat-search-view';
import { useChatSearchStore } from './store/chat-search-store';

/**
 * Hosts the full-screen chat search above the tab navigator. Rendering it here (after the tabs)
 * draws it over the tab bar without hiding the bar, and keeps it mounted underneath any chat or
 * profile pushed from a result, so the back swipe reveals it unchanged.
 */
export function ChatSearchOverlay() {
  const userId = useUserStore((state) => state.user?.id);
  const isOpen = useChatSearchStore((state) => state.isOpen);
  const origin = useChatSearchStore((state) => state.origin);
  const close = useChatSearchStore((state) => state.close);

  // A different account must never see the previous account's search.
  useEffect(() => {
    useChatSearchStore.getState().close();
  }, [userId]);

  if (!isOpen) return null;
  return <ChatSearchView currentUserId={userId} origin={origin} onClosed={close} />;
}
