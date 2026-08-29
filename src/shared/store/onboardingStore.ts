import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type OnboardingData = {
  displayName: string;
  avatarUrl: string | null;
  country: string;
  nativeLanguage: string;
  learningLanguage: string;
  proficiencyLevel: ProficiencyLevel;
  interests: string[];
  bio: string;
};

type OnboardingState = OnboardingData & {
  returnAccountId: string | null;
  update: (values: Partial<OnboardingData>) => void;
  setReturnAccountId: (userId: string | null) => void;
  toggleInterest: (interest: string) => void;
  reset: () => void;
};

export const initialOnboardingData: OnboardingData = {
  displayName: '',
  avatarUrl: null,
  country: '',
  nativeLanguage: '',
  learningLanguage: '',
  proficiencyLevel: 'beginner',
  interests: [],
  bio: '',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialOnboardingData,
      returnAccountId: null,
      update: (values) => set(values),
      setReturnAccountId: (returnAccountId) => set({ returnAccountId }),
      toggleInterest: (interest) =>
        set((state) => ({
          interests: state.interests.includes(interest)
            ? state.interests.filter((item) => item !== interest)
            : [...state.interests, interest],
        })),
      reset: () => set({ ...initialOnboardingData, returnAccountId: null }),
    }),
    {
      name: 'langex-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        displayName,
        avatarUrl,
        country,
        nativeLanguage,
        learningLanguage,
        proficiencyLevel,
        interests,
        bio,
        returnAccountId,
      }) => ({
        displayName,
        avatarUrl,
        country,
        nativeLanguage,
        learningLanguage,
        proficiencyLevel,
        interests,
        bio,
        returnAccountId,
      }),
    },
  ),
);
