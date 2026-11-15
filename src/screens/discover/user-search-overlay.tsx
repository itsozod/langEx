import { useEffect } from 'react';

import { useUserStore } from '@/shared/store/user.store';

import { UserSearchView } from './components/user-search-view';
import { useUserSearchStore } from './store/user-search-store';

/** Hosts the full-screen people search above the tab navigator (see the tabs layout). */
export function UserSearchOverlay() {
  const userId = useUserStore((state) => state.user?.id);
  const isOpen = useUserSearchStore((state) => state.isOpen);
  const origin = useUserSearchStore((state) => state.origin);
  const close = useUserSearchStore((state) => state.close);

  // A different account must never see the previous account's search.
  useEffect(() => {
    useUserSearchStore.getState().close();
  }, [userId]);

  if (!isOpen) return null;
  return <UserSearchView origin={origin} onClosed={close} />;
}
