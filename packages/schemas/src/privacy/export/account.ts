import { utcDateTimeStringSchema } from '../../common/utc-datetime.js';
import { z } from 'zod';

import { usernameSchema } from '../../auth.js';
import { userStatusSchema } from '../../enums.js';

import { profileVisibilitySchema } from '../preferences.js';

export const privacyExportLegalDocumentSchema = z
  .object({
    type: z.enum(['terms_of_service', 'privacy_policy']),
    version: z.string().min(1),
    url: z.string().min(1),
    effectiveAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportLegalDocument = z.infer<
  typeof privacyExportLegalDocumentSchema
>;

export const privacyExportAccountSchema = z
  .object({
    accessState: z.enum(['enabled', 'suspended']),
    id: z.string().min(1),
    email: z.string().email(),
    generation: z.number().int().positive().nullable(),
    lifecycle: z.enum([
      'active',
      'pending_restorable',
      'pending_overdue',
      'finalized',
    ]),
    lifecycleVersion: z.number().int().positive().nullable(),
    lifecycleStateConsistent: z.boolean(),
    restorableUntil: utcDateTimeStringSchema.nullable(),
    status: userStatusSchema,
    emailVerifiedAt: utcDateTimeStringSchema.nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportAccount = z.infer<typeof privacyExportAccountSchema>;

export const privacyExportProfileLinkSchema = z
  .object({
    title: z.string(),
    url: z.string(),
    position: z.number().int().nonnegative(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportProfileLink = z.infer<
  typeof privacyExportProfileLinkSchema
>;

export const privacyExportProfileSchema = z
  .object({
    displayName: z.string().nullable(),
    username: usernameSchema,
    bio: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    avatarBackground: z.string().nullable(),
    avatarForeground: z.string().nullable(),
    bannerPresetId: z.string().nullable(),
    bannerUrl: z.string().nullable(),
    locale: z.string().nullable(),
    timezone: z.string().nullable(),
    createdAt: utcDateTimeStringSchema.nullable(),
    updatedAt: utcDateTimeStringSchema.nullable(),
    links: z.array(privacyExportProfileLinkSchema),
  })
  .strict();
export type PrivacyExportProfile = z.infer<typeof privacyExportProfileSchema>;

export const privacyExportPreferencesSchema = z
  .object({
    marketingEmailsOptIn: z.boolean(),
    productAnalyticsOptIn: z.boolean(),
    profileVisibility: profileVisibilitySchema,
    doNotSellOrShare: z.boolean(),
    limitSensitivePersonalDataUse: z.boolean(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportPreferences = z.infer<
  typeof privacyExportPreferencesSchema
>;

export const privacyExportLegalAcceptanceSchema = z
  .object({
    type: z.string().min(1),
    acceptedAt: utcDateTimeStringSchema,
    legalDocument: privacyExportLegalDocumentSchema.nullable(),
  })
  .strict();
export type PrivacyExportLegalAcceptance = z.infer<
  typeof privacyExportLegalAcceptanceSchema
>;

export const privacyExportConsentEventSchema = z
  .object({
    purpose: z.string().min(1),
    action: z.string().min(1),
    source: z.string().min(1),
    documentVersion: z.string().nullable(),
    createdAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportConsentEvent = z.infer<
  typeof privacyExportConsentEventSchema
>;

export const privacyExportPrivacySectionSchema = z
  .object({
    preferences: privacyExportPreferencesSchema.nullable(),
    legalAcceptances: z.array(privacyExportLegalAcceptanceSchema),
    consentEvents: z.array(privacyExportConsentEventSchema),
  })
  .strict();
export type PrivacyExportPrivacySection = z.infer<
  typeof privacyExportPrivacySectionSchema
>;

export const privacyExportLoginEventSchema = z
  .object({
    action: z.literal('auth.login'),
    outcome: z.enum(['success', 'failure', 'blocked']),
    createdAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportLoginEvent = z.infer<
  typeof privacyExportLoginEventSchema
>;

export const privacyExportPasswordResetEventSchema = z
  .object({
    action: z.enum([
      'auth.password_reset_requested',
      'auth.password_reset_completed',
    ]),
    outcome: z.enum(['accepted', 'success', 'failure']),
    createdAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportPasswordResetEvent = z.infer<
  typeof privacyExportPasswordResetEventSchema
>;

export const privacyExportPrivacyPreferenceChangeSchema = z
  .object({
    action: z.literal('privacy.preferences_updated'),
    outcome: z.literal('success'),
    createdAt: utcDateTimeStringSchema,
    changes: z
      .object({
        marketingEmailsOptIn: z.boolean().optional(),
        productAnalyticsOptIn: z.boolean().optional(),
        profileVisibility: profileVisibilitySchema.optional(),
      })
      .strict(),
  })
  .strict();
export type PrivacyExportPrivacyPreferenceChange = z.infer<
  typeof privacyExportPrivacyPreferenceChangeSchema
>;

export const privacyExportAccountDeletionHistorySchema = z
  .object({
    cancellationChannel: z.enum(['email_token', 'login', 'admin']).nullable(),
    requestedAt: utcDateTimeStringSchema,
    expiresAt: utcDateTimeStringSchema,
    confirmedAt: utcDateTimeStringSchema.nullable(),
    finalizationClaimedAt: utcDateTimeStringSchema.nullable(),
    generation: z.number().int().positive(),
    lifecycle: z.enum([
      'active',
      'pending_restorable',
      'pending_overdue',
      'finalized',
    ]),
    lifecycleVersion: z.number().int().positive(),
    restorableUntil: utcDateTimeStringSchema.nullable(),
    cancelledAt: utcDateTimeStringSchema.nullable(),
    finalizedAt: utcDateTimeStringSchema.nullable(),
  })
  .strict();
export type PrivacyExportAccountDeletionHistory = z.infer<
  typeof privacyExportAccountDeletionHistorySchema
>;

export const privacyExportSecurityHistorySchema = z
  .object({
    logins: z.array(privacyExportLoginEventSchema),
    passwordResets: z.array(privacyExportPasswordResetEventSchema),
    privacyPreferenceChanges: z.array(
      privacyExportPrivacyPreferenceChangeSchema,
    ),
    accountDeletionRequests: z.array(privacyExportAccountDeletionHistorySchema),
    consentChanges: z.array(privacyExportConsentEventSchema),
  })
  .strict();
export type PrivacyExportSecurityHistory = z.infer<
  typeof privacyExportSecurityHistorySchema
>;
