import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

export const profileVisibilitySchema = z.enum(['public', 'private']);
export type ProfileVisibility = z.infer<typeof profileVisibilitySchema>;

export const privacyPreferencesSchema = z.object({
  marketingEmailsOptIn: z.boolean(),
  productAnalyticsOptIn: z.boolean(),
  profileVisibility: profileVisibilitySchema,
  doNotSellOrShare: z.boolean(),
  limitSensitivePersonalDataUse: z.boolean(),
  updatedAt: utcDateTimeStringSchema,
});
export type PrivacyPreferences = z.infer<typeof privacyPreferencesSchema>;

export const updatePrivacyPreferencesRequestSchema = z.object({
  marketingEmailsOptIn: z.boolean().optional(),
  productAnalyticsOptIn: z.boolean().optional(),
  profileVisibility: profileVisibilitySchema.optional(),
  acceptPendingFollowRequests: z.boolean().optional(),
});
export type UpdatePrivacyPreferencesRequest = z.infer<
  typeof updatePrivacyPreferencesRequestSchema
>;

export const privacyRequestTypeSchema = z.enum([
  'export',
  'account_deletion',
  'correction',
  'email_change_or_identity_update',
  'processing_objection',
  'restriction_or_pause_review',
  'processor_or_sharing_information',
  'consent_withdrawal_help',
  'other_privacy_request',
]);
export type PrivacyRequestType = z.infer<typeof privacyRequestTypeSchema>;

export const createPrivacyRequestRequestSchema = z.object({
  type: privacyRequestTypeSchema.exclude(['account_deletion']),
  userProvidedDetails: z.string().min(1).max(2000).optional(),
});
export type CreatePrivacyRequestRequest = z.infer<
  typeof createPrivacyRequestRequestSchema
>;

export const privacyRequestStatusSchema = z.enum([
  'pending',
  'in_review',
  'completed',
  'rejected',
  'cancelled',
]);
export type PrivacyRequestStatus = z.infer<typeof privacyRequestStatusSchema>;

export const privacyRequestClosedReasonSchema = z.enum([
  'fulfilled',
  'partially_fulfilled',
  'cannot_verify_identity',
  'not_applicable',
  'legal_exception',
  'withdrawn_by_user',
  'duplicate',
  'other',
]);
export type PrivacyRequestClosedReason = z.infer<
  typeof privacyRequestClosedReasonSchema
>;

export const privacyRequestSchema = z.object({
  id: z.string().min(1),
  type: privacyRequestTypeSchema,
  status: privacyRequestStatusSchema,
  userProvidedDetails: z.string().nullable(),
  closedReasonCode: privacyRequestClosedReasonSchema.nullable(),
  acknowledgedAt: utcDateTimeStringSchema.nullable(),
  dueAt: utcDateTimeStringSchema.nullable(),
  requestedAt: utcDateTimeStringSchema,
  completedAt: utcDateTimeStringSchema.nullable(),
});
export type PrivacyRequest = z.infer<typeof privacyRequestSchema>;

export const privacyRequestsResponseSchema = z.object({
  items: z.array(privacyRequestSchema),
});
export type PrivacyRequestsResponse = z.infer<
  typeof privacyRequestsResponseSchema
>;

export const cancelPrivacyRequestResponseSchema = z.object({
  message: z.string(),
  status: privacyRequestStatusSchema,
});
export type CancelPrivacyRequestResponse = z.infer<
  typeof cancelPrivacyRequestResponseSchema
>;
