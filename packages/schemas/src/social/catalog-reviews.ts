import { createCursorPaginatedResponseSchema } from '../common/pagination.js';
import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import { coverGeometrySchema } from '../catalog/cover-geometry.js';
import { catalogWorkTypeSchema } from '../enums/catalog-work.js';
import { catalogReviewStatusSchema } from '../enums.js';
import {
  BIO_MAX_LENGTH,
  CATALOG_REVIEW_BODY_MAX_LENGTH,
  CATALOG_REVIEW_EXCERPT_MAX_LENGTH,
  CATALOG_REVIEW_TITLE_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from '../limits.js';

export const CATALOG_REVIEW_LIST_MAX_LIMIT = 50;
export const CATALOG_REVIEW_DISCOVERY_DEFAULT_LIMIT = 20;

export const catalogReviewAuthorSchema = z
  .object({
    avatar: avatarSchema,
    bio: z.string().max(BIO_MAX_LENGTH).nullable(),
    displayName: z.string().nullable(),
    id: z.string().min(1),
    username: z.string().min(1).max(USERNAME_MAX_LENGTH),
  })
  .strict();
export type CatalogReviewAuthor = z.infer<typeof catalogReviewAuthorSchema>;

export const catalogReviewTargetSummarySchema = z
  .object({
    id: z.string().min(1),
    subtitle: z.string().nullable(),
    title: z.string().min(1),
    type: z.literal('catalog_work'),
  })
  .strict();
export type CatalogReviewTargetSummary = z.infer<
  typeof catalogReviewTargetSummarySchema
>;

export const catalogReviewSchema = z
  .object({
    author: catalogReviewAuthorSchema,
    authorUserId: z.string().min(1),
    body: z.string().min(1).max(CATALOG_REVIEW_BODY_MAX_LENGTH),
    catalogEditionId: z.string().min(1).nullable(),
    createdAt: utcDateTimeStringSchema,
    deletedAt: utcDateTimeStringSchema.nullable(),
    id: z.string().min(1),
    publishedAt: utcDateTimeStringSchema.nullable(),
    catalogWorkId: z.string().min(1),
    status: catalogReviewStatusSchema,
    target: catalogReviewTargetSummarySchema,
    title: z.string().min(1).max(CATALOG_REVIEW_TITLE_MAX_LENGTH),
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type CatalogReview = z.infer<typeof catalogReviewSchema>;

export const publicCatalogReviewSchema = catalogReviewSchema.extend({
  publishedAt: utcDateTimeStringSchema,
  status: z.literal('published'),
});
export type PublicCatalogReview = z.infer<typeof publicCatalogReviewSchema>;

export const createCatalogReviewRequestSchema = z
  .object({
    body: z.string().min(1).max(CATALOG_REVIEW_BODY_MAX_LENGTH),
    catalogEditionId: z.string().uuid().nullable().optional(),
    catalogWorkId: z.string().uuid(),
    title: z.string().min(1).max(CATALOG_REVIEW_TITLE_MAX_LENGTH),
  })
  .strict();
export type CreateCatalogReviewRequest = z.infer<
  typeof createCatalogReviewRequestSchema
>;

export const updateCatalogReviewRequestSchema = z
  .object({
    body: z.string().min(1).max(CATALOG_REVIEW_BODY_MAX_LENGTH).optional(),
    title: z.string().min(1).max(CATALOG_REVIEW_TITLE_MAX_LENGTH).optional(),
  })
  .strict();
export type UpdateCatalogReviewRequest = z.infer<
  typeof updateCatalogReviewRequestSchema
>;

export const publishCatalogReviewRequestSchema = z.object({}).strict();
export type PublishCatalogReviewRequest = z.infer<
  typeof publishCatalogReviewRequestSchema
>;

export const profileCatalogReviewsQuerySchema = z
  .object({
    cursor: z.string().min(1).max(512).optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(CATALOG_REVIEW_LIST_MAX_LIMIT)
      .optional(),
  })
  .strict();
export type ProfileCatalogReviewsQuery = z.infer<
  typeof profileCatalogReviewsQuerySchema
>;

export const catalogReviewDiscoveryQuerySchema = z
  .object({
    cursor: z.string().min(1).max(512).optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(CATALOG_REVIEW_LIST_MAX_LIMIT)
      .optional(),
  })
  .strict();
export type CatalogReviewDiscoveryQuery = z.infer<
  typeof catalogReviewDiscoveryQuerySchema
>;

export const catalogReviewSummaryAuthorSchema = z
  .object({
    userId: z.string().min(1),
    username: z.string().min(1).max(USERNAME_MAX_LENGTH),
    displayName: z.string().nullable(),
    avatar: avatarSchema,
  })
  .strict();

export const catalogReviewSummaryCatalogWorkSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    type: catalogWorkTypeSchema,
    subtitle: z.string().nullable(),
    coverUrl: z.string().nullable(),
    coverThumbnailUrl: z.string().nullable(),
    coverGeometry: coverGeometrySchema.nullable(),
  })
  .strict();

export const catalogReviewSummaryCatalogEditionSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().nullable(),
  })
  .strict();

export const catalogReviewSummarySchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(CATALOG_REVIEW_TITLE_MAX_LENGTH),
    excerpt: z.string().max(CATALOG_REVIEW_EXCERPT_MAX_LENGTH).nullable(),
    publishedAt: utcDateTimeStringSchema,
    author: catalogReviewSummaryAuthorSchema,
    catalogWork: catalogReviewSummaryCatalogWorkSchema,
    catalogEdition: catalogReviewSummaryCatalogEditionSchema.nullable(),
    commentCount: z.number().int().nonnegative(),
  })
  .strict();
export type CatalogReviewSummary = z.infer<typeof catalogReviewSummarySchema>;

export const cursorPaginatedCatalogReviewsSchema =
  createCursorPaginatedResponseSchema(catalogReviewSummarySchema);
export type CursorPaginatedCatalogReviews = z.infer<
  typeof cursorPaginatedCatalogReviewsSchema
>;

export function buildCatalogReviewExcerpt(body: string): string | null {
  const normalized = body.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    return null;
  }

  if (normalized.length <= CATALOG_REVIEW_EXCERPT_MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, CATALOG_REVIEW_EXCERPT_MAX_LENGTH - 1)}…`;
}

export const profileCatalogReviewsResponseSchema =
  createCursorPaginatedResponseSchema(publicCatalogReviewSchema);
export type ProfileCatalogReviewsResponse = z.infer<
  typeof profileCatalogReviewsResponseSchema
>;

export const myCatalogReviewDraftsResponseSchema = z.object({
  items: z.array(catalogReviewSchema),
});
export type MyCatalogReviewDraftsResponse = z.infer<
  typeof myCatalogReviewDraftsResponseSchema
>;

export const catalogWorkCatalogReviewsResponseSchema = z.object({
  items: z.array(publicCatalogReviewSchema),
});
export type CatalogWorkCatalogReviewsResponse = z.infer<
  typeof catalogWorkCatalogReviewsResponseSchema
>;

export const catalogWorkCatalogReviewsQuerySchema = z
  .object({
    authorUserId: z.string().uuid().optional(),
  })
  .strict();
export type CatalogWorkCatalogReviewsQuery = z.infer<
  typeof catalogWorkCatalogReviewsQuerySchema
>;

export const viewerCatalogReviewResponseSchema = z.object({
  item: catalogReviewSchema.nullable(),
});
export type ViewerCatalogReviewResponse = z.infer<
  typeof viewerCatalogReviewResponseSchema
>;
