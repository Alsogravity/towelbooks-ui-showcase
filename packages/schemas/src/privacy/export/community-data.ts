import { utcDateTimeStringSchema } from '../../common/utc-datetime.js';
import { z } from 'zod';

import { commentTargetTypeSchema } from '../../enums.js';

export const privacyExportDiscussionSchema = z
  .object({
    id: z.string().min(1),
    roomId: z.string().min(1),
    roomSlug: z.string().min(1).nullable(),
    roomName: z.string().min(1).nullable(),
    title: z.string().min(1),
    body: z.string().min(1),
    pinnedAt: utcDateTimeStringSchema.nullable(),
    lockedAt: utcDateTimeStringSchema.nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    deletedAt: utcDateTimeStringSchema.nullable(),
  })
  .strict();
export type PrivacyExportDiscussion = z.infer<
  typeof privacyExportDiscussionSchema
>;

export const privacyExportActivityEventSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    scope: z.string().min(1),
    visibility: z.string().min(1),
    lifecycleStatus: z.string().min(1),
    moderationStatus: z.string().min(1),
    sourceType: z.string().min(1),
    sourceId: z.string().min(1).nullable(),
    roomId: z.string().min(1).nullable(),
    hiddenAt: utcDateTimeStringSchema.nullable(),
    hiddenReason: z.string().nullable(),
    occurredAt: utcDateTimeStringSchema,
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportActivityEvent = z.infer<
  typeof privacyExportActivityEventSchema
>;

export const privacyExportCommentSchema = z
  .object({
    id: z.string().min(1),
    targetType: commentTargetTypeSchema,
    catalogWorkId: z.string().min(1).nullable(),
    catalogEditionId: z.string().min(1).nullable(),
    catalogReviewId: z.string().min(1).nullable(),
    contributorId: z.string().min(1).nullable(),
    libraryId: z.string().min(1).nullable(),
    roomId: z.string().min(1).nullable(),
    roomSlug: z.string().min(1).nullable(),
    roomName: z.string().min(1).nullable(),
    readingId: z.string().min(1).nullable(),
    readingTitle: z.string().nullable(),
    activityEventId: z.string().min(1).nullable(),
    discussionId: z.string().min(1).nullable(),
    citation: z.string().nullable(),
    body: z.string().min(1),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportComment = z.infer<typeof privacyExportCommentSchema>;
