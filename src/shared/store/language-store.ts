import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import i18n from '@/shared/i18n';
import { type AppLanguage, DEFAULT_LANGUAGE, isAppLanguage } from '@/shared/i18n/languages';

type LanguageState = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => {
        set({ language });
        void i18n.changeLanguage(language);
      },
    }),
    {
      name: 'langex-app-language',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ language }) => ({ language }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<LanguageState> | undefined;
        const language = isAppLanguage(persisted?.language) ? persisted.language : DEFAULT_LANGUAGE;
        return { ...currentState, language };
      },
      onRehydrateStorage: () => (state) => {
        const language = state?.language ?? DEFAULT_LANGUAGE;
        if (i18n.language !== language) void i18n.changeLanguage(language);
      },
    },
  ),
);

export function useLanguageHydration() {
  const [hasHydrated, setHasHydrated] = useState(useLanguageStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribeHydrate = useLanguageStore.persist.onHydrate(() => setHasHydrated(false));
    const unsubscribeFinish = useLanguageStore.persist.onFinishHydration(() =>
      setHasHydrated(true),
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(useLanguageStore.persist.hasHydrated());

    return () => {
      unsubscribeHydrate();
      unsubscribeFinish();
    };
  }, []);

  return hasHydrated;
}
