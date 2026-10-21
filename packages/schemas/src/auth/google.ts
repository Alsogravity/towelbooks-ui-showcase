import { z } from 'zod';

import { appLocaleSchema } from '../common/app-locale.js';
import { loginResponseSchema } from './credentials.js';
import { messageResponseSchema, usernameSchema } from './identity.js';
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH } from '../limits.js';
import { legalVersionIdSchema } from './legal-acceptance.js';

const DISPLAY_NAME_NO_EDGE_WHITESPACE_PATTERN = /^(?!\s)(?!.*\s$)[\s\S]*$/u;
const DISPLAY_NAME_SAFE_CHARACTERS_PATTERN = /^[^\p{Cc}<>]*$/u;

export const googleCompleteRegistrationRequestSchema = z.object({
  avatarChoice: z.enum(['google', 'initial']),
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH)
    .max(USERNAME_MAX_LENGTH)
    .regex(
      /^[a-z0-9_-]+$/,
      'username must contain only lowercase letters, numbers, underscores, and hyphens',
    ),
  displayName: z
    .string()
    .min(2)
    .max(60)
    .regex(
      DISPLAY_NAME_NO_EDGE_WHITESPACE_PATTERN,
      'displayName must not start or end with whitespace',
    )
    .regex(
      DISPLAY_NAME_SAFE_CHARACTERS_PATTERN,
      'displayName contains invalid characters',
    )
    .optional(),
  locale: appLocaleSchema.optional(),
  adultConfirmed: z.literal(true, {
    message: 'adultConfirmed must be accepted.',
  }),
  termsAccepted: z.literal(true, {
    message: 'termsAccepted must be accepted.',
  }),
  termsVersion: legalVersionIdSchema,
  privacyPolicyAcknowledged: z.literal(true, {
    message: 'privacyPolicyAcknowledged must be accepted.',
  }),
  privacyPolicyVersion: legalVersionIdSchema,
});

export type GoogleCompleteRegistrationRequest = z.infer<
  typeof googleCompleteRegistrationRequestSchema
>;

export const googleCompleteRegistrationResponseSchema =
  loginResponseSchema.extend({
    avatarImportWarning: z.boolean(),
  });

export type GoogleCompleteRegistrationResponse = z.infer<
  typeof googleCompleteRegistrationResponseSchema
>;

export const googleOnboardingContextResponseSchema = z.object({
  avatarAvailable: z.boolean(),
  suggestedDisplayName: z.string().nullable(),
  suggestedUsername: usernameSchema,
});

export type GoogleOnboardingContextResponse = z.infer<
  typeof googleOnboardingContextResponseSchema
>;

export const googleUnlinkResponseSchema = messageResponseSchema;
export type GoogleUnlinkResponse = z.infer<typeof googleUnlinkResponseSchema>;

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;
const CHALLENGE_TOKEN_MIN_LENGTH = 1;
export const GOOGLE_LINK_CHALLENGE_TOKEN_MAX_LENGTH = 2048;

export const googleLinkChallengeRequestSchema = z.object({
  challengeToken: z
    .string()
    .min(CHALLENGE_TOKEN_MIN_LENGTH)
    .max(GOOGLE_LINK_CHALLENGE_TOKEN_MAX_LENGTH),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});

export type GoogleLinkChallengeRequest = z.infer<
  typeof googleLinkChallengeRequestSchema
>;

export const googleLinkChallengeResponseSchema = loginResponseSchema;

export type GoogleLinkChallengeResponse = z.infer<
  typeof googleLinkChallengeResponseSchema
>;

export const googleLinkStartResponseSchema = z.object({
  redirectUrl: z.string().url(),
});

export type GoogleLinkStartResponse = z.infer<
  typeof googleLinkStartResponseSchema
>;

export const oauthReactivationConfirmRequestSchema = z.object({});

export type OAuthReactivationConfirmRequest = z.infer<
  typeof oauthReactivationConfirmRequestSchema
>;

export const oauthReactivationConfirmResponseSchema = loginResponseSchema;

export type OAuthReactivationConfirmResponse = z.infer<
  typeof oauthReactivationConfirmResponseSchema
>;

export const reactivationContextResponseSchema = z.object({
  active: z.boolean(),
  proved: z.boolean(),
  expiresAt: z.string().nullable(),
  restorableUntil: z.string().datetime().nullable(),
  recentAuthenticationSatisfied: z.boolean(),
});

export type ReactivationContextResponse = z.infer<
  typeof reactivationContextResponseSchema
>;

export const abandonReactivationRequestSchema = z.object({});

export type AbandonReactivationRequest = z.infer<
  typeof abandonReactivationRequestSchema
>;

export const abandonReactivationResponseSchema = z.object({
  message: z.string(),
});

export type AbandonReactivationResponse = z.infer<
  typeof abandonReactivationResponseSchema
>;
