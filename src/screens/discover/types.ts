export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type DiscoverUser = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  nativeLanguage: string | null;
  learningLanguage: string | null;
  proficiencyLevel: ProficiencyLevel | null;
  interests: string[];
  sharedInterests: string[];
  bio: string | null;
};

export type DiscoverResponse = {
  users: DiscoverUser[];
  total: number;
  hasMore: boolean;
};

export type PublicUser = Omit<DiscoverUser, 'sharedInterests'> & {
  email: string;
  isProfileComplete: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicUserResponse = {
  user: PublicUser;
};
