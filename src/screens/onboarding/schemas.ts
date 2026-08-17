import { z } from 'zod';

export const basicInfoSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required.'),
});

export const countrySchema = z.object({
  country: z.string().length(2, 'Choose your country.'),
});

export const languagesSchema = z
  .object({
    nativeLanguage: z.string().min(1, 'Choose your native language.'),
    learningLanguage: z.string().min(1, 'Choose the language you are learning.'),
    proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  })
  .refine(({ nativeLanguage, learningLanguage }) => nativeLanguage !== learningLanguage, {
    message: 'Learning language must be different from your native language.',
    path: ['learningLanguage'],
  });

export const bioSchema = z.object({
  bio: z.string().max(150, 'Bio must be 150 characters or fewer.'),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type CountryFormValues = z.infer<typeof countrySchema>;
export type LanguagesFormValues = z.infer<typeof languagesSchema>;
export type BioFormValues = z.infer<typeof bioSchema>;
