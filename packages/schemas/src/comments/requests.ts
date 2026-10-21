import { z } from 'zod';

import { commentTargetTypeSchema } from '../enums.js';
import {
  COMMENT_BODY_MAX_LENGTH,
  COMMENT_CITATION_MAX_LENGTH,
} from '../limits.js';

export const createCommentRequestSchema = z
  .object({
    targetType: commentTargetTypeSchema,
    targetId: z.string().uuid(),
    parentCommentId: z.string().uuid().optional(),
    citation: z.string().max(COMMENT_CITATION_MAX_LENGTH).nullable().optional(),
    body: z.string().min(1).max(COMMENT_BODY_MAX_LENGTH),
  })
  .strict();
export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>;

export const updateCommentRequestSchema = z
  .object({
    citation: z.string().max(COMMENT_CITATION_MAX_LENGTH).nullable().optional(),
    body: z.string().min(1).max(COMMENT_BODY_MAX_LENGTH).optional(),
  })
  .strict();
export type UpdateCommentRequest = z.infer<typeof updateCommentRequestSchema>;
