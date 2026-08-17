export type AuthUser = {
  id: string;
  email: string;
  isProfileComplete: boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  country?: string | null;
  nativeLanguage?: string | null;
  learningLanguage?: string | null;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | null;
  interests?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = AuthCredentials & {
  confirmPassword: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser;
};
