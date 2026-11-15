import { z } from 'zod';

export const basicInfoSchema = z.object({
  displayName: z.string().trim().min(1, 'onboarding:validation.displayNameRequired'),
});

export const countrySchema = z.object({
  country: z.string().length(2, 'onboarding:validation.countryRequired'),
});

export const languagesSchema = z
  .object({
    nativeLanguage: z.string().min(1, 'onboarding:validation.nativeLanguageRequired'),
    learningLanguage: z.string().min(1, 'onboarding:validation.learningLanguageRequired'),
    proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  })
  .refine(({ nativeLanguage, learningLanguage }) => nativeLanguage !== learningLanguage, {
    message: 'onboarding:validation.languagesMustDiffer',
    path: ['learningLanguage'],
  });

export const bioSchema = z.object({
  bio: z.string().max(150, 'onboarding:validation.bioTooLong'),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type CountryFormValues = z.infer<typeof countrySchema>;
export type LanguagesFormValues = z.infer<typeof languagesSchema>;
export type BioFormValues = z.infer<typeof bioSchema>;
