import { z } from 'zod';

export const commentTargetTypeSchema = z.enum([
  'catalog_work',
  'catalog_edition',
  'contributor',
  'library',
  'room',
  'reading',
  'activity_event',
  'discussion',
  'catalog_review',
]);
export type CommentTargetType = z.infer<typeof commentTargetTypeSchema>;

export const reactionTargetTypeSchema = z.enum([
  'catalog_work',
  'comment',
  'activity_event',
  'discussion',
]);
export type ReactionTargetType = z.infer<typeof reactionTargetTypeSchema>;

export const reactionTypeSchema = z.enum(['like']);
export type ReactionType = z.infer<typeof reactionTypeSchema>;

export const catalogReviewStatusSchema = z.enum(['draft', 'published']);
export type CatalogReviewStatus = z.infer<typeof catalogReviewStatusSchema>;

export const catalogReviewVisibilitySchema = z.enum([
  'public',
  'followers',
  'private',
]);
export type CatalogReviewVisibility = z.infer<
  typeof catalogReviewVisibilitySchema
>;
