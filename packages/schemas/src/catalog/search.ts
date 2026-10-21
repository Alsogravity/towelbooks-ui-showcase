import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import {
  catalogSourceProviderSchema,
  catalogWorkTypeSchema,
} from '../enums/catalog-work.js';
import {
  READING_AUTHOR_MAX_LENGTH,
  READING_TITLE_MAX_LENGTH,
} from '../limits.js';
import { coverGeometrySchema } from './cover-geometry.js';
import { catalogLanguageTagSchema } from './language.js';
import { supportedLocaleSchema } from './taxonomy-localization.js';

const CATALOG_CATEGORY_SLUG_MAX_LENGTH = 120;

export const catalogSearchQuerySchema = z.object({
  query: z.string().max(READING_TITLE_MAX_LENGTH).optional(),
  isbn: z.string().max(32).optional(),
  asin: z.string().max(32).optional(),
  kind: catalogWorkTypeSchema.optional(),
  categorySlug: z.string().max(CATALOG_CATEGORY_SLUG_MAX_LENGTH).optional(),
  contributorName: z.string().min(1).max(READING_AUTHOR_MAX_LENGTH).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

export type CatalogSearchQuery = z.infer<typeof catalogSearchQuerySchema>;

export const catalogContributorNameSchema = z
  .string()
  .min(1)
  .max(READING_AUTHOR_MAX_LENGTH);

export const catalogWorkTagSchema = z.string().trim().min(1).max(80);

export const catalogAssignedCategorySchema = z.object({
  slug: z.string().min(1).max(CATALOG_CATEGORY_SLUG_MAX_LENGTH),
  displayName: z.string().min(1),
  displayNameLocale: supportedLocaleSchema,
  isPrimary: z.boolean(),
});

export type CatalogAssignedCategory = z.infer<
  typeof catalogAssignedCategorySchema
>;

export const catalogPurchaseLinkResolutionReasonSchema = z.enum([
  'first_available_edition',
]);

export type CatalogPurchaseLinkResolutionReason = z.infer<
  typeof catalogPurchaseLinkResolutionReasonSchema
>;

export const catalogPurchaseLinkSchema = z.object({
  platform: z.literal('amazon'),
  url: z.string().url(),
  isAffiliate: z.literal(true),
  source: z.literal('generated'),
  catalogEditionId: z.string().min(1),
  resolutionReason: catalogPurchaseLinkResolutionReasonSchema,
});

export type CatalogPurchaseLink = z.infer<typeof catalogPurchaseLinkSchema>;

export const catalogEditionSchema = z
  .object({
    asin: z.string().nullable().optional(),
    id: z.string().min(1),
    purchaseLink: catalogPurchaseLinkSchema.nullable(),
    title: z.string().min(1),
    subtitle: z.string().nullable(),
    synopsis: z.string().nullable(),
    language: catalogLanguageTagSchema.nullable(),
    publisher: z.string().nullable(),
    imprint: z.string().nullable(),
    isbn10: z.string().nullable(),
    isbn13: z.string().nullable(),
    editionNumber: z.string().max(80).nullable(),
    publishedDate: utcDateTimeStringSchema.nullable(),
    seriesOrCollection: z.string().max(240).nullable(),
    pageCount: z.number().int().positive().nullable(),
    volume: z.string().max(80).nullable(),
    verificationStatus: z.enum([
      'unverified',
      'provider_matched',
      'manually_verified',
    ]),
    coverUrl: z.string().nullable(),
    coverThumbnailUrl: z.string().nullable(),
    source: catalogSourceProviderSchema,
    sourceId: z.string().min(1).nullable(),
    sourceUrl: z.string().nullable(),
    contributors: z.array(catalogContributorNameSchema),
  })
  .strict();

export type CatalogEdition = z.infer<typeof catalogEditionSchema>;

export const catalogDisplaySchema = z
  .object({
    title: z.string().min(1),
    subtitle: z.string().nullable(),
    synopsis: z.string().nullable(),
    language: catalogLanguageTagSchema.nullable(),
    catalogEditionId: z.string().min(1).nullable(),
    coverCatalogEditionId: z.string().min(1).nullable().optional(),
    coverUrl: z.string().nullable(),
    coverThumbnailUrl: z.string().nullable(),
    coverGeometry: coverGeometrySchema.nullable().optional(),
  })
  .strict();

export type CatalogDisplay = z.infer<typeof catalogDisplaySchema>;

export const catalogItemSchema = z
  .object({
    id: z.string().min(1),
    kind: catalogWorkTypeSchema,
    display: catalogDisplaySchema,
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    averageRating: z.number().min(0).max(5).nullable(),
    contributors: z.array(catalogContributorNameSchema),
    categories: z.array(catalogAssignedCategorySchema).default([]),
    tags: z.array(catalogWorkTagSchema).max(30).optional(),
    catalogEditions: z.array(catalogEditionSchema),
  })
  .strict();

export type CatalogItem = z.infer<typeof catalogItemSchema>;

export const catalogSearchCandidateSchema = z
  .object({
    candidateType: z.literal('local'),
    catalogWorkId: z.string().min(1),
    display: catalogDisplaySchema,
    source: catalogSourceProviderSchema.nullable(),
    sourceId: z.string().min(1).nullable(),
    kind: catalogWorkTypeSchema,
    contributors: z.array(catalogContributorNameSchema),
    coverUrl: z.string().nullable(),
    coverThumbnailUrl: z.string().nullable(),
    /** Intrinsic dimensions of the resolved work-level artwork, when known. */
    coverGeometry: coverGeometrySchema.nullable().optional(),
    publishedDate: utcDateTimeStringSchema.nullable(),
    isbn10: z.string().nullable(),
    isbn13: z.string().nullable(),
    publisher: z.string().nullable(),
    pageCount: z.number().int().positive().nullable(),
    averageRating: z.number().min(0).max(5).nullable(),
    // Provider-derived discovery signals (e.g. Open Library). Distinct from the
    // first-party averageRating; used only for recommendation ranking. Optional
    // so existing callers/fixtures need not set them; the API always supplies
    // them (number or null).
    externalPopularity: z.number().int().min(0).nullable().optional(),
    externalRating: z.number().min(0).nullable().optional(),
    categories: z.array(catalogAssignedCategorySchema).default([]),
    tags: z.array(catalogWorkTagSchema).max(30).optional(),
  })
  .strict();

export type CatalogSearchCandidate = z.infer<
  typeof catalogSearchCandidateSchema
>;

export const paginatedCatalogSearchResponseSchema = z.object({
  items: z.array(catalogSearchCandidateSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type PaginatedCatalogSearchResponse = z.infer<
  typeof paginatedCatalogSearchResponseSchema
>;
