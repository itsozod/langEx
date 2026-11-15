import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'auth:validation.emailRequired')
  .pipe(z.email({ error: 'auth:validation.emailInvalid' }))
  .transform((email) => email.toLowerCase());

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'auth:validation.passwordRequired'),
});

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(1, 'auth:validation.confirmPasswordRequired'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'auth:validation.passwordsMismatch',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.input<typeof loginSchema>;
export type RegisterFormValues = z.input<typeof registerSchema>;
