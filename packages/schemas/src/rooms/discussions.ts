import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import { reactionSummarySchema } from '../reactions.js';
import {
  DISCUSSION_BODY_MAX_LENGTH,
  DISCUSSION_TITLE_MAX_LENGTH,
} from '../limits.js';

export const discussionAuthorSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
});
export type DiscussionAuthor = z.infer<typeof discussionAuthorSchema>;

export const discussionSchema = z
  .object({
    id: z.string().uuid(),
    roomId: z.string().uuid(),
    authorUserId: z.string().uuid(),
    author: discussionAuthorSchema,
    title: z.string().min(1),
    body: z.string().min(1),
    excerpt: z.string().nullable(),
    commentCount: z.number().int().nonnegative(),
    reactions: reactionSummarySchema,
    lastActivityAt: utcDateTimeStringSchema,
    pinnedAt: utcDateTimeStringSchema.nullable(),
    lockedAt: utcDateTimeStringSchema.nullable(),
    deletedAt: utcDateTimeStringSchema.nullable(),
    viewerCanDelete: z.boolean(),
    viewerCanEdit: z.boolean(),
    viewerCanModerate: z.boolean(),
    viewerCanReply: z.boolean(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type Discussion = z.infer<typeof discussionSchema>;

export const paginatedDiscussionsResponseSchema = z.object({
  items: z.array(discussionSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedDiscussionsResponse = z.infer<
  typeof paginatedDiscussionsResponseSchema
>;

export const createDiscussionRequestSchema = z
  .object({
    title: z.string().min(1).max(DISCUSSION_TITLE_MAX_LENGTH),
    body: z.string().min(1).max(DISCUSSION_BODY_MAX_LENGTH),
  })
  .strict();
export type CreateDiscussionRequest = z.infer<
  typeof createDiscussionRequestSchema
>;

export const updateDiscussionRequestSchema = z
  .object({
    title: z.string().min(1).max(DISCUSSION_TITLE_MAX_LENGTH),
    body: z.string().min(1).max(DISCUSSION_BODY_MAX_LENGTH),
  })
  .partial()
  .strict();
export type UpdateDiscussionRequest = z.infer<
  typeof updateDiscussionRequestSchema
>;
