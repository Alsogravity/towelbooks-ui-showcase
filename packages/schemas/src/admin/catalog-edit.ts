import { z } from 'zod';

import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { CONTRIBUTION_MAX_CONTRIBUTORS_PER_ROLE } from '../catalog/contribution-resolution.js';
import {
  catalogWorkListingStatusSchema,
  catalogWorkTypeSchema,
} from '../enums/catalog-work.js';
import { catalogLanguageTagSchema } from '../catalog/language.js';

const nullableText = (max: number) => z.string().max(max).nullable();

export const adminCatalogEditContributorSchema = z.object({
  name: z.string().min(1).max(240),
  role: z.enum([
    'author',
    'editor',
    'illustrator',
    'translator',
    'narrator',
    'contributor',
  ]),
});

export type AdminCatalogEditContributor = z.infer<
  typeof adminCatalogEditContributorSchema
>;

export const adminCatalogEditEditionSchema = z.object({
  asin: z.string().nullable(),
  coverMediaAssetId: z.string().nullable(),
  coverThumbnailUrl: z.string().nullable(),
  coverUrl: z.string().nullable(),
  editionNumber: nullableText(80),
  hidden: z.boolean(),
  id: z.string().min(1),
  imprint: nullableText(240),
  isbn10: z.string().nullable(),
  isbn13: z.string().nullable(),
  language: catalogLanguageTagSchema.nullable(),
  pageCount: z.number().int().positive().nullable(),
  publishedDate: utcDateTimeStringSchema.nullable(),
  publisher: nullableText(240),
  resolvedCoverThumbnailUrl: z.string().nullable(),
  resolvedCoverUrl: z.string().nullable(),
  seriesOrCollection: nullableText(240),
  source: z.string(),
  sourceId: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  subtitle: nullableText(240),
  synopsis: z.string().nullable(),
  title: z.string().min(1).max(240),
  verificationStatus: z.enum([
    'unverified',
    'provider_matched',
    'manually_verified',
  ]),
  volume: nullableText(80),
  contributors: z.array(adminCatalogEditContributorSchema),
});

export type AdminCatalogEditEdition = z.infer<
  typeof adminCatalogEditEditionSchema
>;

export const adminCatalogEditTargetSchema = z.object({
  selectedEditionId: z.string().nullable(),
  work: z.object({
    categories: z.array(
      z.object({ slug: z.string(), displayName: z.string() }),
    ),
    catalogListingStatus: catalogWorkListingStatusSchema,
    hidden: z.boolean(),
    id: z.string().min(1),
    tags: z.array(z.string().max(80)),
    type: catalogWorkTypeSchema,
  }),
  editions: z.array(adminCatalogEditEditionSchema),
});

export type AdminCatalogEditTarget = z.infer<
  typeof adminCatalogEditTargetSchema
>;

export const updateAdminCatalogEditRequestSchema = z.object({
  authors: z
    .array(z.string().min(1).max(240))
    .max(CONTRIBUTION_MAX_CONTRIBUTORS_PER_ROLE),
  categorySlugs: z.array(z.string().min(1).max(120)),
  coverMediaAssetId: z.string().nullable().optional(),
  coverUrl: z.string().max(2048).nullable().optional(),
  editionNumber: nullableText(80),
  hideCatalogWork: z.boolean(),
  hideEdition: z.boolean(),
  imprint: nullableText(240),
  language: catalogLanguageTagSchema.nullable(),
  pageCount: z.number().int().positive().nullable(),
  publicationDate: utcDateTimeStringSchema.nullable(),
  publisher: nullableText(240),
  seriesOrCollection: nullableText(240),
  subtitle: nullableText(240),
  synopsis: z.string().max(10000).nullable(),
  tags: z.array(z.string().min(1).max(80)).max(30),
  title: z.string().trim().min(1).max(240),
  type: catalogWorkTypeSchema,
  translators: z
    .array(z.string().min(1).max(240))
    .max(CONTRIBUTION_MAX_CONTRIBUTORS_PER_ROLE),
  volume: nullableText(80),
});

export type UpdateAdminCatalogEditRequest = z.infer<
  typeof updateAdminCatalogEditRequestSchema
>;
