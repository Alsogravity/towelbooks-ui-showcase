import { z } from 'zod';

import { reactionTargetTypeSchema, reactionTypeSchema } from '../enums.js';

export const reactionTargetQuerySchema = z
  .object({
    targetId: z.string().uuid(),
    targetType: reactionTargetTypeSchema,
  })
  .strict();

export const createReactionRequestSchema = z
  .object({
    reactionType: reactionTypeSchema,
    targetId: z.string().uuid(),
    targetType: reactionTargetTypeSchema,
  })
  .strict();

export const reactionCountsSchema = z
  .object({
    like: z.number().int().nonnegative(),
  })
  .strict();

export const reactionSummarySchema = z
  .object({
    counts: reactionCountsSchema,
    viewerReaction: reactionTypeSchema.nullable(),
  })
  .strict();

export const reactionSummaryResponseSchema = z
  .object({
    counts: reactionCountsSchema,
    targetId: z.string().uuid(),
    targetType: reactionTargetTypeSchema,
    viewerReaction: reactionTypeSchema.nullable(),
  })
  .strict();

export type ReactionTargetQuery = z.infer<typeof reactionTargetQuerySchema>;
export type CreateReactionRequest = z.infer<typeof createReactionRequestSchema>;
export type ReactionCounts = z.infer<typeof reactionCountsSchema>;
export type ReactionSummary = z.infer<typeof reactionSummarySchema>;
export type ReactionSummaryResponse = z.infer<
  typeof reactionSummaryResponseSchema
>;
