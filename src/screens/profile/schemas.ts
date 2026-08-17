import { z } from 'zod';

export const editProfileSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required.'),
  bio: z.string().max(150, 'Bio must be 150 characters or fewer.'),
  nativeLanguage: z.string().min(1, 'Choose your native language.'),
  learningLanguage: z.string().min(1, 'Choose the language you are learning.'),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  interests: z.array(z.string()).min(3, 'Choose at least 3 interests.'),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
