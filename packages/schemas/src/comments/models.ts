import { createCursorPaginatedResponseSchema } from '../common/pagination.js';
import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import { commentTargetTypeSchema } from '../enums.js';
import { reactionSummarySchema } from '../reactions.js';

export const commentAuthorSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
});

export const commentSchema = z
  .object({
    id: z.string().min(1),
    authorUserId: z.string().min(1),
    targetType: commentTargetTypeSchema,
    targetId: z.string().min(1),
    parentCommentId: z.string().min(1).nullable(),
    depth: z.number().int().nonnegative(),
    catalogWorkId: z.string().min(1).nullable(),
    catalogEditionId: z.string().min(1).nullable(),
    catalogReviewId: z.string().min(1).nullable(),
    contributorId: z.string().min(1).nullable(),
    libraryId: z.string().min(1).nullable(),
    roomId: z.string().min(1).nullable(),
    readingId: z.string().nullable(),
    activityEventId: z.string().min(1).nullable(),
    discussionId: z.string().min(1).nullable(),
    author: commentAuthorSchema,
    citation: z.string().nullable(),
    body: z.string().min(1).nullable(),
    deletedAt: utcDateTimeStringSchema.nullable(),
    reactions: reactionSummarySchema,
    replyCount: z.number().int().nonnegative(),
    viewerCanDelete: z.boolean(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();

export const COMMENTS_DEFAULT_LIMIT = 20;
export const COMMENTS_MAX_LIMIT = 100;

export const listCommentsQuerySchema = z
  .object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(COMMENTS_MAX_LIMIT).optional(),
    parentCommentId: z.string().uuid().optional(),
    targetId: z.string().uuid(),
    targetType: commentTargetTypeSchema,
  })
  .strict();
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;

export const cursorPaginatedCommentsResponseSchema =
  createCursorPaginatedResponseSchema(commentSchema);
export type CursorPaginatedCommentsResponse = z.infer<
  typeof cursorPaginatedCommentsResponseSchema
>;

export type CommentAuthor = z.infer<typeof commentAuthorSchema>;
export type Comment = z.infer<typeof commentSchema>;
