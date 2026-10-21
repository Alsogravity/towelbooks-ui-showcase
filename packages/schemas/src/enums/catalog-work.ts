import { z } from 'zod';

export const catalogWorkTypeSchema = z.enum(['book', 'manga', 'comic']);
export type CatalogWorkType = z.infer<typeof catalogWorkTypeSchema>;

export const catalogWorkListingStatusSchema = z.enum([
  'listed',
  'hidden',
  'under_review',
]);
export type CatalogWorkListingStatus = z.infer<
  typeof catalogWorkListingStatusSchema
>;

export const catalogSourceProviderSchema = z.enum(['manual', 'open_library']);
export type CatalogSourceProvider = z.infer<typeof catalogSourceProviderSchema>;

export const catalogEditionVerificationStatusSchema = z.enum([
  'unverified',
  'provider_matched',
  'manually_verified',
]);
export type CatalogEditionVerificationStatus = z.infer<
  typeof catalogEditionVerificationStatusSchema
>;
