import { utcDateTimeStringSchema } from '../../common/utc-datetime.js';
import { z } from 'zod';

import { ratingCatalogWorkSchema } from '../../auth.js';
import {
  catalogReviewStatusSchema,
  catalogReviewVisibilitySchema,
} from '../../enums.js';
import {
  CATALOG_REVIEW_BODY_MAX_LENGTH,
  CATALOG_REVIEW_TITLE_MAX_LENGTH,
  RATING_NOTE_MAX_LENGTH,
} from '../../limits.js';

export const privacyExportRatingSchema = z
  .object({
    catalogWork: ratingCatalogWorkSchema,
    catalogWorkId: z.string().min(1),
    id: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    note: z.string().max(RATING_NOTE_MAX_LENGTH).nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    deletedAt: utcDateTimeStringSchema.nullable(),
  })
  .strict();
export type PrivacyExportRating = z.infer<typeof privacyExportRatingSchema>;

export const privacyExportCatalogReviewTargetSchema = z
  .object({
    id: z.string().min(1),
    subtitle: z.string().nullable(),
    title: z.string().min(1),
    type: z.literal('catalog_work'),
  })
  .strict();
export type PrivacyExportCatalogReviewTarget = z.infer<
  typeof privacyExportCatalogReviewTargetSchema
>;

export const privacyExportCatalogReviewSchema = z
  .object({
    id: z.string().min(1),
    catalogWorkId: z.string().min(1),
    catalogEditionId: z.string().min(1).nullable(),
    title: z.string().min(1).max(CATALOG_REVIEW_TITLE_MAX_LENGTH),
    body: z.string().min(1).max(CATALOG_REVIEW_BODY_MAX_LENGTH),
    status: catalogReviewStatusSchema,
    visibility: catalogReviewVisibilitySchema,
    publishedAt: utcDateTimeStringSchema.nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    deletedAt: utcDateTimeStringSchema.nullable(),
    target: privacyExportCatalogReviewTargetSchema,
  })
  .strict();
export type PrivacyExportCatalogReview = z.infer<
  typeof privacyExportCatalogReviewSchema
>;
