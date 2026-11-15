import { z } from 'zod';

export const editProfileSchema = z.object({
  displayName: z.string().trim().min(1, 'onboarding:validation.displayNameRequired'),
  bio: z.string().max(150, 'onboarding:validation.bioTooLong'),
  nativeLanguage: z.string().min(1, 'onboarding:validation.nativeLanguageRequired'),
  learningLanguage: z.string().min(1, 'onboarding:validation.learningLanguageRequired'),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  interests: z.array(z.string()).min(3, 'profile:edit.interestsMinimum'),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
