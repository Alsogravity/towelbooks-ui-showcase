import { z } from 'zod';

import { offsetPaginatedResponseSchema } from '../common/pagination.js';
import { privacyRequestSchema } from '../privacy/preferences.js';

export const adminMediaAssetItemSchema = z.object({
  id: z.string(),
  kind: z.string(),
  status: z.string(),
  uploaderUsername: z.string().nullable(),
  contentType: z.string().nullable(),
  sizeBytes: z.number().int().nullable(),
  createdAt: z.string(),
});

export type AdminMediaAssetItem = z.infer<typeof adminMediaAssetItemSchema>;

export const adminMediaAssetsResponseSchema = offsetPaginatedResponseSchema(
  adminMediaAssetItemSchema,
);

export type AdminMediaAssetsResponse = z.infer<
  typeof adminMediaAssetsResponseSchema
>;

export const adminPrivacyRequestItemSchema = z.object({
  ...privacyRequestSchema.pick({
    id: true,
    type: true,
    status: true,
    requestedAt: true,
    completedAt: true,
  }).shape,
  email: z.string(),
  username: z.string(),
});

export type AdminPrivacyRequestItem = z.infer<
  typeof adminPrivacyRequestItemSchema
>;

export const adminPrivacyRequestsResponseSchema = offsetPaginatedResponseSchema(
  adminPrivacyRequestItemSchema,
);

export type AdminPrivacyRequestsResponse = z.infer<
  typeof adminPrivacyRequestsResponseSchema
>;
