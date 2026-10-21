import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import { createCursorPaginatedResponseSchema } from '../common/pagination.js';
import { pollDerivedStatusSchema } from '../enums.js';
import { coverGeometrySchema } from '../catalog/cover-geometry.js';
import { reactionSummarySchema } from '../reactions.js';

export const ROOM_ACTIVITY_DEFAULT_LIMIT = 20;
export const ROOM_ACTIVITY_MAX_LIMIT = 100;
export const ROOM_ACTIVITY_FEED_PREFERENCES_MAX_COUNT = 8;

export const activityEventHiddenReasonSchema = z.enum([
  'source_archived',
  'source_deleted',
  'source_status_reversed',
  'preference_hidden',
  'moderation',
  'privacy',
]);
export type ActivityEventHiddenReason = z.infer<
  typeof activityEventHiddenReasonSchema
>;

export const activitySourceTypeSchema = z.enum([
  'reading',
  'comment',
  'discussion',
  'poll',
  'room_announcement',
  'room_meeting',
  'room_member',
  'rating',
  'catalog_review',
  'reading_session',
  'reading_note',
]);
export type ActivitySourceType = z.infer<typeof activitySourceTypeSchema>;

export const activityScopeSchema = z.enum(['room', 'profile']);
export type ActivityScope = z.infer<typeof activityScopeSchema>;

export const activityVisibilitySchema = z.enum([
  'private',
  'room_members',
  'followers',
  'profile_public',
  'public',
]);
export type ActivityVisibility = z.infer<typeof activityVisibilitySchema>;

export const activityLifecycleStatusSchema = z.enum([
  'active',
  'hidden',
  'redacted',
]);
export type ActivityLifecycleStatus = z.infer<
  typeof activityLifecycleStatusSchema
>;

export const activityModerationStatusSchema = z.enum([
  'clean',
  'pending',
  'rejected',
]);
export type ActivityModerationStatus = z.infer<
  typeof activityModerationStatusSchema
>;

export const roomActivityEventTypeSchema = z.enum([
  'room.reading_created',
  'room.reading_finished',
  'room.note_created',
  'room.announcement_created',
  'room.discussion_created',
  'room.poll_created',
  'room.poll_closed',
  'room.member_joined',
  'room.meeting_created',
  'room.meeting_updated',
  'room.meeting_cancelled',
]);
export type RoomActivityEventType = z.infer<typeof roomActivityEventTypeSchema>;

export const userActivityEventTypeSchema = z.enum([
  'user.reading_finished',
  'user.rating_created',
  // eslint-disable-next-line no-secrets/no-secrets -- stable activity event name, not a secret
  'user.catalog_review_published',
  'user.reading_note_created',
]);
export type UserActivityEventType = z.infer<typeof userActivityEventTypeSchema>;

export const activityEventTypeSchema = z.enum([
  ...roomActivityEventTypeSchema.options,
  ...userActivityEventTypeSchema.options,
]);
export type ActivityEventType = z.infer<typeof activityEventTypeSchema>;

export const activityActorSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
});
export type ActivityActor = z.infer<typeof activityActorSchema>;

export const activityEventReadingSourceSchema = z.object({
  title: z.string().min(1),
  catalogWorkId: z.string().min(1),
  author: z.string().nullable(),
  coverUrl: z.string().nullable(),
  coverThumbnailUrl: z.string().nullable(),
  coverGeometry: coverGeometrySchema.nullable().optional(),
});
export type ActivityEventReadingSource = z.infer<
  typeof activityEventReadingSourceSchema
>;

export const activityEventReadingNoteSourceSchema = z.object({
  content: z.string().min(1),
  pageStart: z.number().int().positive().nullable(),
  pageEnd: z.number().int().positive().nullable(),
  readingSessionId: z.string().min(1),
  catalogWorkId: z.string().min(1),
  catalogEditionId: z.string().min(1).nullable(),
  title: z.string().min(1),
  author: z.string().nullable(),
  coverUrl: z.string().nullable(),
  coverThumbnailUrl: z.string().nullable(),
  coverGeometry: coverGeometrySchema.nullable().optional(),
});
export type ActivityEventReadingNoteSource = z.infer<
  typeof activityEventReadingNoteSourceSchema
>;

export const activityEventDiscussionSourceSchema = z.object({
  title: z.string().min(1),
});
export type ActivityEventDiscussionSource = z.infer<
  typeof activityEventDiscussionSourceSchema
>;

export const activityEventAnnouncementSourceSchema = z.object({
  body: z.string().min(1),
  title: z.string().nullable(),
});
export type ActivityEventAnnouncementSource = z.infer<
  typeof activityEventAnnouncementSourceSchema
>;

export const activityEventNoteSourceSchema = z.object({
  preview: z.string().nullable(),
  readingTitle: z.string().nullable(),
});
export type ActivityEventNoteSource = z.infer<
  typeof activityEventNoteSourceSchema
>;

export const activityEventPollResultPreviewSchema = z.object({
  label: z.string().nullable(),
  percentage: z.number().min(0).max(100),
});
export type ActivityEventPollResultPreview = z.infer<
  typeof activityEventPollResultPreviewSchema
>;

export const activityEventPollSourceSchema = z.object({
  title: z.string().min(1),
  status: pollDerivedStatusSchema,
  startsAt: utcDateTimeStringSchema,
  endsAt: utcDateTimeStringSchema.nullable(),
  closedAt: utcDateTimeStringSchema.nullable(),
  questionCount: z.number().int().nonnegative(),
  totalResponses: z.number().int().nonnegative(),
  topResultsPreview: z.array(activityEventPollResultPreviewSchema).optional(),
});
export type ActivityEventPollSource = z.infer<
  typeof activityEventPollSourceSchema
>;

export const activityEventRatingSourceSchema = z.object({
  rating: z.number().int().min(1).max(5),
  catalogWorkTitle: z.string().nullable(),
});
export type ActivityEventRatingSource = z.infer<
  typeof activityEventRatingSourceSchema
>;

export const activityEventCatalogReviewSourceSchema = z.object({
  title: z.string().nullable(),
  catalogWorkTitle: z.string().nullable(),
});
export type ActivityEventCatalogReviewSource = z.infer<
  typeof activityEventCatalogReviewSourceSchema
>;

export const activityEventEngagementSchema = z
  .object({
    commentCount: z.number().int().nonnegative(),
    reactions: reactionSummarySchema,
  })
  .strict();
export type ActivityEventEngagement = z.infer<
  typeof activityEventEngagementSchema
>;

export const activityEventSourceSchema = z
  .object({
    announcement: activityEventAnnouncementSourceSchema.optional(),
    discussion: activityEventDiscussionSourceSchema.optional(),
    note: activityEventNoteSourceSchema.optional(),
    poll: activityEventPollSourceSchema.optional(),
    reading: activityEventReadingSourceSchema.optional(),
    readingNote: activityEventReadingNoteSourceSchema.optional(),
    rating: activityEventRatingSourceSchema.optional(),
    catalogReview: activityEventCatalogReviewSourceSchema.optional(),
  })
  .strict();
export type ActivityEventSource = z.infer<typeof activityEventSourceSchema>;

export const activityEventSchema = z
  .object({
    id: z.string().min(1),
    type: activityEventTypeSchema,
    actor: activityActorSchema.nullable(),
    roomId: z.string().min(1).nullable(),
    ownerUserId: z.string().min(1).nullable(),
    sourceType: activitySourceTypeSchema,
    sourceId: z.string().min(1).nullable(),
    scope: activityScopeSchema,
    visibility: activityVisibilitySchema,
    lifecycleStatus: activityLifecycleStatusSchema,
    moderationStatus: activityModerationStatusSchema,
    hiddenReason: activityEventHiddenReasonSchema.nullable(),
    metadata: z.record(z.string(), z.unknown()),
    source: activityEventSourceSchema,
    occurredAt: utcDateTimeStringSchema,
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    hiddenAt: utcDateTimeStringSchema.nullable(),
  })
  .extend(activityEventEngagementSchema.shape);
export type ActivityEvent = z.infer<typeof activityEventSchema>;

export const activityEventRoomContextSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
});
export type ActivityEventRoomContext = z.infer<
  typeof activityEventRoomContextSchema
>;

export const viewerRoomActivityEventSchema = activityEventSchema.extend({
  room: activityEventRoomContextSchema,
});
export type ViewerRoomActivityEvent = z.infer<
  typeof viewerRoomActivityEventSchema
>;

/** Cursor-paginated activity list (profile and room feeds). */
export const paginatedActivityEventsResponseSchema =
  createCursorPaginatedResponseSchema(activityEventSchema);
export type PaginatedActivityEventsResponse = z.infer<
  typeof paginatedActivityEventsResponseSchema
>;

export const listProfileActivityEventsQuerySchema = z
  .object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(ROOM_ACTIVITY_MAX_LIMIT)
      .optional(),
  })
  .strict();
export type ListProfileActivityEventsQuery = z.infer<
  typeof listProfileActivityEventsQuerySchema
>;

export const listRoomActivityEventsQuerySchema = z
  .object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(ROOM_ACTIVITY_MAX_LIMIT)
      .optional(),
  })
  .strict();
export type ListRoomActivityEventsQuery = z.infer<
  typeof listRoomActivityEventsQuerySchema
>;

/** Cursor-paginated room activity feed. */
export const cursorPaginatedActivityEventsResponseSchema =
  createCursorPaginatedResponseSchema(activityEventSchema);
export type CursorPaginatedActivityEventsResponse = z.infer<
  typeof cursorPaginatedActivityEventsResponseSchema
>;

/** Cursor-paginated cross-room viewer activity feed. */
export const cursorPaginatedViewerRoomActivityEventsResponseSchema =
  createCursorPaginatedResponseSchema(viewerRoomActivityEventSchema);
export type CursorPaginatedViewerRoomActivityEventsResponse = z.infer<
  typeof cursorPaginatedViewerRoomActivityEventsResponseSchema
>;

export const roomActivityFeedPreferenceSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  activityType: roomActivityEventTypeSchema,
  visible: z.boolean(),
  updatedByUserId: z.string().min(1),
  createdAt: utcDateTimeStringSchema,
  updatedAt: utcDateTimeStringSchema,
});
export type RoomActivityFeedPreference = z.infer<
  typeof roomActivityFeedPreferenceSchema
>;

export const paginatedRoomActivityFeedPreferencesResponseSchema = z.object({
  items: z.array(roomActivityFeedPreferenceSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRoomActivityFeedPreferencesResponse = z.infer<
  typeof paginatedRoomActivityFeedPreferencesResponseSchema
>;

export const updateRoomActivityFeedPreferencesRequestSchema = z
  .object({
    preferences: z
      .array(
        z.object({
          activityType: roomActivityEventTypeSchema,
          visible: z.boolean(),
        }),
      )
      .min(1)
      .max(ROOM_ACTIVITY_FEED_PREFERENCES_MAX_COUNT)
      .superRefine((preferences, context) => {
        const activityTypes = preferences.map(
          (preference) => preference.activityType,
        );
        if (new Set(activityTypes).size !== activityTypes.length) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'activityType values must be unique.',
          });
        }
      }),
  })
  .strict();
export type UpdateRoomActivityFeedPreferencesRequest = z.infer<
  typeof updateRoomActivityFeedPreferencesRequestSchema
>;

export const DEFAULT_ROOM_ACTIVITY_FEED_VISIBILITY = {
  'room.announcement_created': true,
  'room.discussion_created': true,
  'room.meeting_cancelled': true,
  'room.meeting_created': true,
  'room.meeting_updated': true,
  'room.member_joined': false,
  'room.note_created': true,
  'room.poll_closed': true,
  'room.poll_created': true,
  'room.reading_created': true,
  'room.reading_finished': true,
} as const satisfies Record<RoomActivityEventType, boolean>;

// Room announcement contract schemas live in ./rooms.ts, where the board
// resource that owns announcement CRUD is defined.
