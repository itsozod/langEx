import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'auth:validation.emailRequired')
  .pipe(z.email({ error: 'auth:validation.emailInvalid' }))
  .transform((email) => email.toLowerCase());

const utf8ByteLength = (value: string) => {
  let length = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    length += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
  }

  return length;
};

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'auth:validation.passwordRequired'),
});

const newPasswordSchema = z
  .string()
  .min(1, 'auth:validation.passwordRequired')
  .min(8, 'auth:validation.passwordMinLength')
  .refine((password) => utf8ByteLength(password) <= 72, {
    message: 'auth:validation.passwordMaxBytes',
  });

export const registerSchema = z
  .object({
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'auth:validation.confirmPasswordRequired'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'auth:validation.passwordsMismatch',
    path: ['confirmPassword'],
  });

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmationSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'auth:validation.confirmPasswordRequired'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'auth:validation.passwordsMismatch',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.input<typeof loginSchema>;
export type RegisterFormValues = z.input<typeof registerSchema>;
export type PasswordResetRequestFormValues = z.input<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmationFormValues = z.input<typeof passwordResetConfirmationSchema>;
