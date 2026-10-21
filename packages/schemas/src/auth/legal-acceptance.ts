import { legalDocumentTypeSchema } from '../enums/legal-document.js';
import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { isLegalVersionId } from '../legal-documents/constants.js';
import { z } from 'zod';

const privacyPolicyPrefix = 'privacy_policy';
const privacyPolicyAcknowledgementValue =
  `${privacyPolicyPrefix}_acknowledgement` as const;

export const requiredLegalAcceptanceTypeSchema = z.enum([
  'adult_attestation',
  'terms_acceptance',
  privacyPolicyAcknowledgementValue,
]);
export type RequiredLegalAcceptanceType = z.infer<
  typeof requiredLegalAcceptanceTypeSchema
>;

export const legalVersionIdSchema = z
  .string()
  .refine(isLegalVersionId, 'Expected a legal version in YYYY-MM-DD format.');

export const legalAcceptanceSelectionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('adult_attestation') }).strict(),
  z
    .object({
      type: z.literal('terms_acceptance'),
      version: legalVersionIdSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal(privacyPolicyAcknowledgementValue),
      version: legalVersionIdSchema,
    })
    .strict(),
]);
export type LegalAcceptanceSelection = z.infer<
  typeof legalAcceptanceSelectionSchema
>;

export const requiredLegalAcceptanceDocumentSchema = z.object({
  id: z.string().uuid(),
  content: z.unknown().optional(),
  contentHash: z.record(z.string(), z.string()).optional(),
  effectiveAt: utcDateTimeStringSchema,
  type: z.enum(['terms_of_service', 'privacy_policy']),
  url: z.string().min(1),
  version: z.string().min(1),
});
export type RequiredLegalAcceptanceDocument = z.infer<
  typeof requiredLegalAcceptanceDocumentSchema
>;

export const requiredLegalAcceptanceSchema = z.object({
  type: requiredLegalAcceptanceTypeSchema,
  legalDocument: requiredLegalAcceptanceDocumentSchema.optional(),
});
export type RequiredLegalAcceptance = z.infer<
  typeof requiredLegalAcceptanceSchema
>;

export const legalDocumentSchema = z.object({
  id: z.string().uuid(),
  content: z.unknown(),
  contentHash: z.record(z.string(), z.string()),
  effectiveAt: utcDateTimeStringSchema,
  type: legalDocumentTypeSchema,
  url: z.string().min(1),
  version: z.string().min(1),
});
export type LegalDocument = z.infer<typeof legalDocumentSchema>;

export const activeLegalDocumentsResponseSchema = z.object({
  items: z.array(legalDocumentSchema),
});
export type ActiveLegalDocumentsResponse = z.infer<
  typeof activeLegalDocumentsResponseSchema
>;
