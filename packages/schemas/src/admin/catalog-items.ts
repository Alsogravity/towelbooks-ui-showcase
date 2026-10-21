import { z } from 'zod';

import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { catalogWorkListingStatusSchema } from '../enums/catalog-work.js';
import { offsetPaginatedResponseSchema } from '../common/pagination.js';
import { adminCatalogItemMatchContextSchema } from '../catalog/admin-catalog-list.js';
import { catalogLanguageTagSchema } from '../catalog/language.js';

export const adminCatalogListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  primaryContributor: z.string().nullable(),
  kind: z.enum(['book', 'manga', 'comic']),
  catalogListingStatus: catalogWorkListingStatusSchema,
  catalogListingStatusReason: z.string().nullable(),
  catalogListingStatusUpdatedAt: z.string().nullable(),
  catalogListingStatusUpdatedByUserId: z.string().uuid().nullable(),
  editionCount: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
  matchContext: adminCatalogItemMatchContextSchema.nullable(),
});

export type AdminCatalogListItem = z.infer<typeof adminCatalogListItemSchema>;

export const adminCatalogItemsResponseSchema = offsetPaginatedResponseSchema(
  adminCatalogListItemSchema,
);

export type AdminCatalogItemsResponse = z.infer<
  typeof adminCatalogItemsResponseSchema
>;

export const adminCatalogItemEditableSchema = z.object({
  language: catalogLanguageTagSchema.nullable(),
  publishedDate: utcDateTimeStringSchema.nullable(),
  synopsis: z.string().nullable(),
  title: z.string(),
  subtitle: z.string().nullable(),
  sourceUrl: z.string().nullable(),
});

export type AdminCatalogItemEditable = z.infer<
  typeof adminCatalogItemEditableSchema
>;

export const adminCatalogItemEditionSchema = z.object({
  id: z.string(),
  title: z.string(),
  isbn13: z.string().nullable(),
  editionNumber: z.string().max(80).nullable(),
  publishedDate: utcDateTimeStringSchema.nullable(),
  seriesOrCollection: z.string().max(240).nullable(),
  source: z.string().nullable(),
  verificationStatus: z.enum([
    'unverified',
    'provider_matched',
    'manually_verified',
  ]),
  volume: z.string().max(80).nullable(),
});

export const adminCatalogItemContributorSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});

export const adminCatalogItemSourceSchema = z.object({
  provider: z.string(),
  sourceId: z.string().nullable(),
  sourceUrl: z.string().nullable(),
});

export const adminCatalogItemDetailResponseSchema = z.object({
  item: adminCatalogListItemSchema,
  editable: adminCatalogItemEditableSchema,
  aliases: z.array(z.string()),
  editions: z.array(adminCatalogItemEditionSchema),
  contributors: z.array(adminCatalogItemContributorSchema),
  sources: z.array(adminCatalogItemSourceSchema),
  tags: z.array(z.string().max(80)).max(30),
});

export type AdminCatalogItemDetailResponse = z.infer<
  typeof adminCatalogItemDetailResponseSchema
>;

export const updateAdminCatalogListingStatusRequestSchema = z.object({
  status: catalogWorkListingStatusSchema,
  reason: z.string().nullable().optional(),
});

export type UpdateAdminCatalogListingStatusRequest = z.infer<
  typeof updateAdminCatalogListingStatusRequestSchema
>;
