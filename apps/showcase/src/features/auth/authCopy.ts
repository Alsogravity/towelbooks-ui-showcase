import {
  DISPLAY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  isReservedUsername,
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from '@towelbooks/schemas';
import { z } from 'zod';

import { handleApiProblem } from '../errors';

type Translate = (key: string, options?: { fallback?: string }) => string;

type AuthErrorCode =
  | 'AUTH_EMAIL_ALREADY_REGISTERED'
  | 'AUTH_USERNAME_ALREADY_TAKEN'
  | 'AUTH_EMAIL_NOT_VERIFIED'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_INVALID_VERIFICATION_TOKEN'
  | 'AUTH_INVALID_RESET_TOKEN'
  | 'AUTH_WEAK_PASSWORD'
  | 'AUTH_OAUTH_FAILED'
  | 'AUTH_OAUTH_ACCOUNT_EXISTS';

const authErrorMessageKeys: Record<AuthErrorCode, string> = {
  AUTH_EMAIL_ALREADY_REGISTERED: 'auth.errors.emailAlreadyRegistered',
  AUTH_USERNAME_ALREADY_TAKEN: 'auth.errors.usernameAlreadyTaken',
  AUTH_EMAIL_NOT_VERIFIED: 'auth.errors.invalidCredentials',
  AUTH_INVALID_CREDENTIALS: 'auth.errors.invalidCredentials',
  AUTH_INVALID_VERIFICATION_TOKEN: 'auth.errors.invalidVerificationToken',
  AUTH_INVALID_RESET_TOKEN: 'auth.errors.invalidResetToken',
  AUTH_WEAK_PASSWORD: 'auth.errors.weakPassword',
  AUTH_OAUTH_FAILED: 'auth.errors.oauthFallback',
  AUTH_OAUTH_ACCOUNT_EXISTS: 'auth.errors.oauthAccountExists',
};

export function createLoginSchema(t: Translate) {
  return z.object({
    identifier: z
      .string()
      .trim()
      .min(1, t('auth.validation.emailOrUsernameRequired'))
      .max(EMAIL_MAX_LENGTH),
    password: z
      .string()
      .min(12, t('auth.validation.passwordMinLength'))
      .max(PASSWORD_MAX_LENGTH),
  });
}

export type LoginForm = z.infer<ReturnType<typeof createLoginSchema>>;

export function createForgotPasswordSchema(t: Translate) {
  return z.object({
    email: z
      .string()
      .email(t('auth.validation.invalidEmail'))
      .max(EMAIL_MAX_LENGTH),
  });
}

export type ForgotPasswordForm = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

export function createChangePasswordSchema(t: Translate) {
  return z
    .object({
      currentPassword: z
        .string()
        .min(12, t('auth.validation.passwordMinLength'))
        .max(PASSWORD_MAX_LENGTH),
      newPassword: z
        .string()
        .min(12, t('auth.validation.passwordMinLength'))
        .max(PASSWORD_MAX_LENGTH),
      confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('auth.validation.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type ChangePasswordForm = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;

export function createSetPasswordSchema(t: Translate) {
  return z
    .object({
      newPassword: z
        .string()
        .min(12, t('auth.validation.passwordMinLength'))
        .max(PASSWORD_MAX_LENGTH),
      confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('auth.validation.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type SetPasswordForm = z.infer<
  ReturnType<typeof createSetPasswordSchema>
>;

export function createResetPasswordSchema(t: Translate) {
  return z
    .object({
      password: z
        .string()
        .min(12, t('auth.validation.passwordMinLength'))
        .max(PASSWORD_MAX_LENGTH),
      confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.validation.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type ResetPasswordForm = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;

export function createRegisterSchema(t: Translate) {
  return z.object({
    email: z
      .string()
      .email(t('auth.validation.invalidEmail'))
      .max(EMAIL_MAX_LENGTH),
    handle: z
      .string()
      .transform((val) => val.trim().toLowerCase())
      .pipe(
        z
          .string()
          .min(3, t('auth.validation.usernameMinLength'))
          .max(USERNAME_MAX_LENGTH)
          .regex(/^[a-z0-9_-]+$/, t('auth.validation.usernameFormat'))
          .refine(
            (value) => !isReservedUsername(value),
            t('auth.validation.usernameReserved'),
          ),
      ),
    displayName: z
      .string()
      .min(2, t('auth.validation.displayNameMinLength'))
      .max(DISPLAY_NAME_MAX_LENGTH)
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(12, t('auth.validation.passwordMinLength'))
      .max(PASSWORD_MAX_LENGTH),
    adultConfirmed: z
      .boolean()
      .refine((value) => value, t('auth.validation.confirmAdult')),
    termsAccepted: z
      .boolean()
      .refine((value) => value, t('auth.validation.acceptTerms')),
    privacyPolicyAcknowledged: z
      .boolean()
      .refine((value) => value, t('auth.validation.acknowledgePrivacy')),
  });
}

export type RegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>;

export function createGoogleCompleteRegistrationSchema(t: Translate) {
  return z.object({
    displayName: z
      .string()
      .trim()
      .min(2, t('auth.validation.displayNameMinLength'))
      .max(DISPLAY_NAME_MAX_LENGTH)
      .optional()
      .or(z.literal('')),
    handle: z
      .string()
      .transform((val) => val.trim().toLowerCase())
      .pipe(
        z
          .string()
          .min(3, t('auth.validation.usernameMinLength'))
          .max(USERNAME_MAX_LENGTH)
          .regex(/^[a-z0-9_-]+$/, t('auth.validation.usernameFormat'))
          .refine(
            (value) => !isReservedUsername(value),
            t('auth.validation.usernameReserved'),
          ),
      ),
    adultConfirmed: z
      .boolean()
      .refine((value) => value, t('auth.validation.confirmAdult')),
    termsAccepted: z
      .boolean()
      .refine((value) => value, t('auth.validation.acceptTerms')),
    privacyPolicyAcknowledged: z
      .boolean()
      .refine((value) => value, t('auth.validation.acknowledgePrivacy')),
  });
}

export type GoogleCompleteRegistrationForm = z.infer<
  ReturnType<typeof createGoogleCompleteRegistrationSchema>
>;

export function getLocalizedAuthErrorMessage(
  error: unknown,
  t: Translate,
  fallbackKey: string,
) {
  return handleApiProblem(error, {
    fallbackKey,
    messageKeys: authErrorMessageKeys,
    t,
  }).message;
}
