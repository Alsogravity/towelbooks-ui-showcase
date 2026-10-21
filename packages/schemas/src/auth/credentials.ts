import { z } from 'zod';
import { legalVersionIdSchema } from './legal-acceptance.js';

import { avatarBackgroundInputSchema } from '../avatars.js';
import { bannerPresetIdSchema } from '../banner-presets.js';
import { appLocaleSchema } from '../common/app-locale.js';
import {
  BIO_MAX_LENGTH,
  BIO_MAX_LINES,
  DISPLAY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../limits.js';
import { createMaxLinesZodRefine } from '../multiline-text.js';

import {
  messageResponseSchema,
  supportedLocaleModeSchema,
  userSummarySchema,
  usernameSchema,
} from './identity.js';

export const registerRequestSchema = z.object({
  email: z.string().email().max(EMAIL_MAX_LENGTH),
  password: z.string().min(12).max(PASSWORD_MAX_LENGTH),
  displayName: z.string().max(DISPLAY_NAME_MAX_LENGTH).optional(),
  username: usernameSchema,
  locale: appLocaleSchema.optional(),
  adultConfirmed: z.literal(true),
  termsAccepted: z.literal(true),
  termsVersion: legalVersionIdSchema,
  privacyPolicyAcknowledged: z.literal(true),
  privacyPolicyVersion: legalVersionIdSchema,
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const registerResponseSchema = z.object({
  message: z.string(),
  requiresEmailVerification: z.boolean(),
});
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const loginRequestSchema = z.object({
  identifier: z.string().trim().min(1).max(EMAIL_MAX_LENGTH),
  locale: appLocaleSchema.optional(),
  password: z.string().min(12).max(PASSWORD_MAX_LENGTH),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresInSeconds: z.number().int().positive(),
  /** True when the user must re-accept active legal documents before product use. */
  hasPendingLegalAcceptances: z.boolean(),
  user: userSummarySchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const reactivateAccountRequestSchema = loginRequestSchema;
export type ReactivateAccountRequest = LoginRequest;

export const reactivateAccountResponseSchema = loginResponseSchema;
export type ReactivateAccountResponse = LoginResponse;

export const refreshResponseSchema = loginResponseSchema;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

export const verifyEmailRequestSchema = z.object({
  token: z.string().min(16).max(512),
});
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;

export const verifyEmailResponseSchema = messageResponseSchema;
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;

export const resendVerificationEmailRequestSchema = z.object({
  identifier: z.string().trim().min(1).max(EMAIL_MAX_LENGTH),
  locale: appLocaleSchema.optional(),
});
export type ResendVerificationEmailRequest = z.infer<
  typeof resendVerificationEmailRequestSchema
>;

export const resendVerificationEmailResponseSchema = messageResponseSchema;
export type ResendVerificationEmailResponse = z.infer<
  typeof resendVerificationEmailResponseSchema
>;

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email().max(EMAIL_MAX_LENGTH),
  locale: appLocaleSchema.optional(),
});
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

export const forgotPasswordResponseSchema = messageResponseSchema;
export type ForgotPasswordResponse = z.infer<
  typeof forgotPasswordResponseSchema
>;

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(16).max(512),
  newPassword: z.string().min(12).max(PASSWORD_MAX_LENGTH),
});
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

export const resetPasswordResponseSchema = messageResponseSchema;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;

export const logoutResponseSchema = messageResponseSchema;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;

export const updateMeRequestSchema = z
  .object({
    displayName: z
      .string()
      .min(2)
      .max(DISPLAY_NAME_MAX_LENGTH)
      .nullable()
      .optional(),
    username: usernameSchema.optional(),
    bio: z
      .string()
      .max(BIO_MAX_LENGTH)
      .refine(createMaxLinesZodRefine(BIO_MAX_LINES), {
        message: `Bio must not exceed ${BIO_MAX_LINES} lines.`,
      })
      .nullable()
      .optional(),
    locale: appLocaleSchema.nullable().optional(),
    localeMode: supportedLocaleModeSchema.optional(),
    lastResolvedLocale: appLocaleSchema.nullable().optional(),
    avatarBackground: avatarBackgroundInputSchema.optional(),
    bannerPresetId: z.union([bannerPresetIdSchema, z.null()]).optional(),
  })
  .superRefine((value, context) => {
    if (value.localeMode === 'manual' && value.locale === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'locale is required when localeMode is manual.',
        path: ['locale'],
      });
    }

    if (
      value.localeMode === 'auto' &&
      value.locale !== null &&
      value.locale !== undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'locale must be null when localeMode is auto.',
        path: ['locale'],
      });
    }
  });
export type UpdateMeRequest = z.infer<typeof updateMeRequestSchema>;

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(12).max(PASSWORD_MAX_LENGTH).optional(),
  newPassword: z.string().min(12).max(PASSWORD_MAX_LENGTH),
});
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

export const changePasswordResponseSchema = messageResponseSchema;
export type ChangePasswordResponse = z.infer<
  typeof changePasswordResponseSchema
>;

export const deleteAccountRequestSchema = z.object({
  locale: appLocaleSchema.optional(),
  password: z.string().min(12).max(PASSWORD_MAX_LENGTH).optional(),
});
export type DeleteAccountRequest = z.infer<typeof deleteAccountRequestSchema>;

export const deleteAccountResponseSchema = messageResponseSchema;
export type DeleteAccountResponse = z.infer<typeof deleteAccountResponseSchema>;

export const confirmAccountDeletionRequestSchema = z.object({
  token: z.string().min(16).max(512),
});
export type ConfirmAccountDeletionRequest = z.infer<
  typeof confirmAccountDeletionRequestSchema
>;

export const confirmAccountDeletionResponseSchema = messageResponseSchema;
export type ConfirmAccountDeletionResponse = z.infer<
  typeof confirmAccountDeletionResponseSchema
>;

export const cancelAccountDeletionRequestSchema = z.object({
  token: z.string().min(16).max(512),
});
export type CancelAccountDeletionRequest = z.infer<
  typeof cancelAccountDeletionRequestSchema
>;

export const cancelAccountDeletionResponseSchema = messageResponseSchema;
export type CancelAccountDeletionResponse = z.infer<
  typeof cancelAccountDeletionResponseSchema
>;
