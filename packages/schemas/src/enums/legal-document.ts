import { z } from 'zod';

export const legalDocumentTypeSchema = z.enum([
  'privacy_policy',
  'terms_of_service',
  'cookies',
  'privacy_changelog',
]);
export type LegalDocumentType = z.infer<typeof legalDocumentTypeSchema>;
