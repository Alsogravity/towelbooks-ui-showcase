import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import { BIO_MAX_LENGTH, RATING_NOTE_MAX_LENGTH } from '../limits.js';

import { usernameSchema } from './identity.js';

export const ratingCatalogWorkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().nullable(),
});
export type RatingCatalogWork = z.infer<typeof ratingCatalogWorkSchema>;

export const ratingAuthorSchema = z.object({
  avatar: avatarSchema,
  bio: z.string().max(BIO_MAX_LENGTH).nullable(),
  displayName: z.string().nullable(),
  id: z.string().min(1),
  username: usernameSchema,
});
export type RatingAuthor = z.infer<typeof ratingAuthorSchema>;

export const ratingSchema = z
  .object({
    author: ratingAuthorSchema,
    authorUserId: z.string().min(1),
    catalogWork: ratingCatalogWorkSchema,
    catalogWorkId: z.string().min(1),
    note: z.string().max(RATING_NOTE_MAX_LENGTH).nullable(),
    createdAt: utcDateTimeStringSchema,
    deletedAt: utcDateTimeStringSchema.nullable(),
    id: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type Rating = z.infer<typeof ratingSchema>;

export const profileRatingsResponseSchema = z.object({
  items: z.array(ratingSchema),
});
export type ProfileRatingsResponse = z.infer<
  typeof profileRatingsResponseSchema
>;

export const paginatedRatingsResponseSchema = z.object({
  items: z.array(ratingSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRatingsResponse = z.infer<
  typeof paginatedRatingsResponseSchema
>;

export const listCatalogWorkRatingsQuerySchema = z
  .object({
    authorUserId: z.string().uuid().optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().optional(),
  })
  .strict();
export type ListCatalogWorkRatingsQuery = z.infer<
  typeof listCatalogWorkRatingsQuerySchema
>;

export const viewerRatingResponseSchema = z.object({
  item: ratingSchema.nullable(),
});
export type ViewerRatingResponse = z.infer<typeof viewerRatingResponseSchema>;

export const createRatingRequestSchema = z
  .object({
    catalogWorkId: z.string().uuid(),
    note: z.string().min(1).max(RATING_NOTE_MAX_LENGTH).nullable().optional(),
    rating: z.number().int().min(1).max(5),
  })
  .strict();
export type CreateRatingRequest = z.infer<typeof createRatingRequestSchema>;

export const updateRatingRequestSchema = z
  .object({
    note: z.string().min(1).max(RATING_NOTE_MAX_LENGTH).nullable().optional(),
    rating: z.number().int().min(1).max(5).optional(),
  })
  .strict();
export type UpdateRatingRequest = z.infer<typeof updateRatingRequestSchema>;
