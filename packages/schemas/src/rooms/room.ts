import { createCursorPaginatedResponseSchema } from '../common/pagination.js';
import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { activityActorSchema } from './activity-events.js';
import { usernameSchema } from '../auth/identity.js';
import { avatarBackgroundInputSchema, avatarSchema } from '../avatars.js';
import { bannerPresetIdSchema } from '../banner-presets.js';
import { externalLinkSchema } from '../common/external-links.js';
import {
  roomAccessGrantSourceSchema,
  roomJoinPolicySchema,
  roomMeetingLocationTypeSchema,
  roomMeetingStatusSchema,
  roomMemberAccessStateSchema,
  roomMemberRoleSchema,
  roomMemberStatusSchema,
  roomVisibilitySchema,
} from '../enums.js';
import { roomViewerSchema } from './join.js';
import {
  ROOM_ANNOUNCEMENT_BODY_MAX_LENGTH,
  ROOM_ANNOUNCEMENT_TITLE_MAX_LENGTH,
  ROOM_CATEGORIES_MAX_COUNT,
  ROOM_DESCRIPTION_MAX_LENGTH,
  ROOM_DESCRIPTION_MAX_LINES,
  ROOM_MAX_MEMBERS_ABSOLUTE_MAX,
  ROOM_MEETING_DESCRIPTION_MAX_LENGTH,
  ROOM_MEETING_LOCATION_TEXT_MAX_LENGTH,
  ROOM_MEETING_TIMEZONE_MAX_LENGTH,
  ROOM_MEETING_TITLE_MAX_LENGTH,
  ROOM_NAME_MAX_LENGTH,
  SOURCE_URL_MAX_LENGTH,
} from '../limits.js';
import { multilineTextSchema } from '../multiline-text.js';
import { bannerImageSchema } from '../profile/media-assets.js';
import { readingSchema } from './readings.js';
import { supportedLocaleSchema } from '../catalog/taxonomy-localization.js';

const roomDescriptionSchema = multilineTextSchema({
  maxLength: ROOM_DESCRIPTION_MAX_LENGTH,
  maxLines: ROOM_DESCRIPTION_MAX_LINES,
});

export const roomOwnerSchema = z.object({
  displayName: z.string().nullable(),
  avatar: avatarSchema,
});
export type RoomOwner = z.infer<typeof roomOwnerSchema>;

export const roomCategorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  displayNameLocale: supportedLocaleSchema,
});
export type RoomCategory = z.infer<typeof roomCategorySchema>;

export const roomSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  visibility: roomVisibilitySchema,
  joinPolicy: roomJoinPolicySchema,
  maxMembers: z.number().int().nonnegative().nullable(),
  avatar: avatarSchema,
  bannerImage: bannerImageSchema.nullable(),
  bannerPresetId: bannerPresetIdSchema,
  createdByUserId: z.string().min(1),
  createdAt: utcDateTimeStringSchema,
  // Soft lifecycle state. `null` for active rooms. Archived rooms are excluded
  // from list/discovery/feed surfaces and block write operations; the field is
  // exposed so clients can reflect the archived state intentionally.
  archivedAt: utcDateTimeStringSchema.nullish(),
  owner: roomOwnerSchema.nullish(),
  links: z.array(externalLinkSchema).default([]),
  categories: z
    .array(roomCategorySchema)
    .max(ROOM_CATEGORIES_MAX_COUNT)
    .default([]),
});
export type Room = z.infer<typeof roomSchema>;

export const roomDetailSchema = roomSchema.extend({
  viewer: roomViewerSchema,
});
export type RoomDetail = z.infer<typeof roomDetailSchema>;

export const roomOverviewMemberSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().nullable(),
  role: roomMemberRoleSchema,
  avatar: avatarSchema,
});
export type RoomOverviewMember = z.infer<typeof roomOverviewMemberSchema>;

export const roomOverviewSchema = roomDetailSchema.extend({
  memberCount: z.number().int().nonnegative(),
  previewMembers: z.array(roomOverviewMemberSchema).max(3),
  readingsCount: z.number().int().nonnegative(),
});
export type RoomOverview = z.infer<typeof roomOverviewSchema>;

export const roomListItemSchema = roomSchema.extend({
  memberCount: z.number().int().nonnegative(),
  readingsCount: z.number().int().nonnegative(),
  currentReading: readingSchema.nullable(),
  userRole: roomMemberRoleSchema,
  lastActivityAt: utcDateTimeStringSchema,
});
export type RoomListItem = z.infer<typeof roomListItemSchema>;

export const paginatedRoomListResponseSchema = z.object({
  items: z.array(roomListItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRoomListResponse = z.infer<
  typeof paginatedRoomListResponseSchema
>;

export const roomDiscoveryItemSchema = roomSchema.extend({
  memberCount: z.number().int().nonnegative(),
  readingsCount: z.number().int().nonnegative(),
  currentReading: readingSchema.nullable(),
  userRole: roomMemberRoleSchema.nullish(),
});
export type RoomDiscoveryItem = z.infer<typeof roomDiscoveryItemSchema>;

export const profileRoomsResponseSchema = z.object({
  items: z.array(roomDiscoveryItemSchema),
});
export type ProfileRoomsResponse = z.infer<typeof profileRoomsResponseSchema>;

export const paginatedRoomDiscoveryResponseSchema = z.object({
  items: z.array(roomDiscoveryItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRoomDiscoveryResponse = z.infer<
  typeof paginatedRoomDiscoveryResponseSchema
>;

export const createRoomRequestSchema = z.object({
  name: z.string().min(3).max(ROOM_NAME_MAX_LENGTH),
  description: roomDescriptionSchema.optional(),
  bannerPresetId: bannerPresetIdSchema.optional(),
  visibility: roomVisibilitySchema.optional(),
  joinPolicy: roomJoinPolicySchema.optional(),
  maxMembers: z
    .number()
    .int()
    .nonnegative()
    .max(ROOM_MAX_MEMBERS_ABSOLUTE_MAX)
    .optional(),
  categoryIds: z
    .array(z.string().uuid())
    .max(ROOM_CATEGORIES_MAX_COUNT)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'categoryIds must contain unique values.',
    })
    .optional(),
});
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;

export const updateRoomRequestSchema = z
  .object({
    name: z.string().min(3).max(ROOM_NAME_MAX_LENGTH).optional(),
    description: roomDescriptionSchema.optional(),
    bannerPresetId: bannerPresetIdSchema.optional(),
    visibility: roomVisibilitySchema.optional(),
    joinPolicy: roomJoinPolicySchema.optional(),
    avatarBackground: avatarBackgroundInputSchema.optional(),
    maxMembers: z
      .number()
      .int()
      .nonnegative()
      .max(ROOM_MAX_MEMBERS_ABSOLUTE_MAX)
      .optional(),
    categoryIds: z
      .array(z.string().uuid())
      .max(ROOM_CATEGORIES_MAX_COUNT)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: 'categoryIds must contain unique values.',
      })
      .optional(),
  })
  .strict();
export type UpdateRoomRequest = z.infer<typeof updateRoomRequestSchema>;

export const roomMemberAccessGrantSummarySchema = z.object({
  source: roomAccessGrantSourceSchema,
  state: z.enum(['active', 'expired', 'revoked']),
  startsAt: utcDateTimeStringSchema,
  expiresAt: utcDateTimeStringSchema.nullable(),
  revokedAt: utcDateTimeStringSchema.nullable(),
});
export type RoomMemberAccessGrantSummary = z.infer<
  typeof roomMemberAccessGrantSummarySchema
>;

export const roomMemberAccessSchema = z.object({
  state: roomMemberAccessStateSchema,
  activeSources: z.array(roomAccessGrantSourceSchema),
  effectiveExpiresAt: utcDateTimeStringSchema.nullable(),
  grants: z.array(roomMemberAccessGrantSummarySchema),
});
export type RoomMemberAccess = z.infer<typeof roomMemberAccessSchema>;

export const roomMemberSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  username: usernameSchema.nullable(),
  displayName: z.string().nullable(),
  role: roomMemberRoleSchema,
  status: roomMemberStatusSchema,
  joinedAt: utcDateTimeStringSchema,
  bannedAt: utcDateTimeStringSchema.nullable(),
  access: roomMemberAccessSchema,
  avatar: avatarSchema,
});
export type RoomMember = z.infer<typeof roomMemberSchema>;

export const roomBannedMemberSchema = z.object({
  memberId: z.string().min(1),
  userId: z.string().min(1),
  username: usernameSchema.nullable(),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
  role: roomMemberRoleSchema,
  bannedAt: utcDateTimeStringSchema,
});
export type RoomBannedMember = z.infer<typeof roomBannedMemberSchema>;

export const ROOM_MEMBER_ACCESS_CHANGE_REASONS = [
  'manual_grant',
  'manual_extension',
  'manual_expiration_update',
  'access_restored',
  'invite_accepted',
  'courtesy_access',
  'access_correction',
  'policy_violation',
  'user_request',
  'other',
] as const;
export type RoomMemberAccessChangeReason =
  (typeof ROOM_MEMBER_ACCESS_CHANGE_REASONS)[number];

export const roomMemberAccessChangeReasonSchema = z.enum(
  ROOM_MEMBER_ACCESS_CHANGE_REASONS,
);

export const suspendRoomMemberRequestSchema = z.object({}).strict();
export type SuspendRoomMemberRequest = z.infer<
  typeof suspendRoomMemberRequestSchema
>;

export const unsuspendRoomMemberRequestSchema = z.object({}).strict();
export type UnsuspendRoomMemberRequest = z.infer<
  typeof unsuspendRoomMemberRequestSchema
>;

export const setRoomMemberManualAccessRequestSchema = z
  .object({
    expiresAt: utcDateTimeStringSchema.nullable(),
  })
  .strict();
export type SetRoomMemberManualAccessRequest = z.infer<
  typeof setRoomMemberManualAccessRequestSchema
>;

export const revokeRoomMemberManualAccessRequestSchema = z.object({}).strict();
export type RevokeRoomMemberManualAccessRequest = z.infer<
  typeof revokeRoomMemberManualAccessRequestSchema
>;

export const removeRoomMemberRequestSchema = z.object({}).strict();
export type RemoveRoomMemberRequest = z.infer<
  typeof removeRoomMemberRequestSchema
>;

export const banRoomMemberRequestSchema = z.object({}).strict();
export type BanRoomMemberRequest = z.infer<typeof banRoomMemberRequestSchema>;

export const unbanRoomMemberRequestSchema = z.object({}).strict();
export type UnbanRoomMemberRequest = z.infer<
  typeof unbanRoomMemberRequestSchema
>;

export const paginatedRoomMembersResponseSchema =
  createCursorPaginatedResponseSchema(roomMemberSchema);
export type PaginatedRoomMembersResponse = z.infer<
  typeof paginatedRoomMembersResponseSchema
>;

export const paginatedRoomBannedMembersResponseSchema =
  createCursorPaginatedResponseSchema(roomBannedMemberSchema);
export type PaginatedRoomBannedMembersResponse = z.infer<
  typeof paginatedRoomBannedMembersResponseSchema
>;

export const ROOM_MEMBERS_DEFAULT_LIMIT = 20;
export const ROOM_MEMBERS_MAX_LIMIT = 100;

export const listRoomMembersQuerySchema = z
  .object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(ROOM_MEMBERS_MAX_LIMIT)
      .optional(),
    q: z.string().min(1).max(100).optional(),
  })
  .strict();
export type ListRoomMembersQuery = z.infer<typeof listRoomMembersQuerySchema>;

export const roomAnnouncementSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  author: activityActorSchema,
  title: z.string().min(1).nullable(),
  body: z.string().min(1),
  createdAt: utcDateTimeStringSchema,
  updatedAt: utcDateTimeStringSchema,
});
export type RoomAnnouncement = z.infer<typeof roomAnnouncementSchema>;

export const paginatedRoomAnnouncementsResponseSchema = z.object({
  items: z.array(roomAnnouncementSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRoomAnnouncementsResponse = z.infer<
  typeof paginatedRoomAnnouncementsResponseSchema
>;

export const createRoomAnnouncementRequestSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(ROOM_ANNOUNCEMENT_TITLE_MAX_LENGTH)
      .nullable()
      .optional(),
    body: z.string().min(1).max(ROOM_ANNOUNCEMENT_BODY_MAX_LENGTH),
  })
  .strict();
export type CreateRoomAnnouncementRequest = z.infer<
  typeof createRoomAnnouncementRequestSchema
>;

export const updateRoomAnnouncementRequestSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(ROOM_ANNOUNCEMENT_TITLE_MAX_LENGTH)
      .nullable()
      .optional(),
    body: z.string().min(1).max(ROOM_ANNOUNCEMENT_BODY_MAX_LENGTH).optional(),
  })
  .strict();
export type UpdateRoomAnnouncementRequest = z.infer<
  typeof updateRoomAnnouncementRequestSchema
>;

export const roomMeetingScopeSchema = z.enum(['upcoming', 'past', 'all']);
export type RoomMeetingScope = z.infer<typeof roomMeetingScopeSchema>;

export const roomMeetingReadingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
});
export type RoomMeetingReading = z.infer<typeof roomMeetingReadingSchema>;

export const roomMeetingSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  createdByUserId: z.string().min(1),
  readingId: z.string().min(1).nullable(),
  reading: roomMeetingReadingSchema.nullable(),
  title: z.string().min(1),
  description: z.string().nullable(),
  startsAt: utcDateTimeStringSchema,
  endsAt: utcDateTimeStringSchema,
  timezone: z.string().min(1),
  locationType: roomMeetingLocationTypeSchema,
  meetingUrl: z.string().nullable(),
  locationText: z.string().nullable(),
  status: roomMeetingStatusSchema,
  cancelledAt: utcDateTimeStringSchema.nullable(),
  createdAt: utcDateTimeStringSchema,
  updatedAt: utcDateTimeStringSchema,
});
export type RoomMeeting = z.infer<typeof roomMeetingSchema>;

export const paginatedRoomMeetingsResponseSchema = z.object({
  items: z.array(roomMeetingSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRoomMeetingsResponse = z.infer<
  typeof paginatedRoomMeetingsResponseSchema
>;

const roomMeetingUrlSchema = z.string().url().max(SOURCE_URL_MAX_LENGTH);
const roomMeetingLocationTextSchema = z
  .string()
  .min(1)
  .max(ROOM_MEETING_LOCATION_TEXT_MAX_LENGTH);

export const createRoomMeetingRequestSchema = z
  .object({
    title: z.string().min(1).max(ROOM_MEETING_TITLE_MAX_LENGTH),
    description: z
      .string()
      .min(1)
      .max(ROOM_MEETING_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .optional(),
    startsAt: utcDateTimeStringSchema,
    endsAt: utcDateTimeStringSchema,
    timezone: z.string().min(1).max(ROOM_MEETING_TIMEZONE_MAX_LENGTH),
    locationType: roomMeetingLocationTypeSchema,
    meetingUrl: roomMeetingUrlSchema.nullable().optional(),
    locationText: roomMeetingLocationTextSchema.nullable().optional(),
    readingId: z.string().uuid().nullable().optional(),
  })
  .strict();
export type CreateRoomMeetingRequest = z.infer<
  typeof createRoomMeetingRequestSchema
>;

export const updateRoomMeetingRequestSchema = z
  .object({
    title: z.string().min(1).max(ROOM_MEETING_TITLE_MAX_LENGTH).optional(),
    description: z
      .string()
      .min(1)
      .max(ROOM_MEETING_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .optional(),
    startsAt: utcDateTimeStringSchema.optional(),
    endsAt: utcDateTimeStringSchema.optional(),
    timezone: z
      .string()
      .min(1)
      .max(ROOM_MEETING_TIMEZONE_MAX_LENGTH)
      .optional(),
    locationType: roomMeetingLocationTypeSchema.optional(),
    meetingUrl: roomMeetingUrlSchema.nullable().optional(),
    locationText: roomMeetingLocationTextSchema.nullable().optional(),
    readingId: z.string().uuid().nullable().optional(),
  })
  .strict();
export type UpdateRoomMeetingRequest = z.infer<
  typeof updateRoomMeetingRequestSchema
>;

export const cancelRoomMeetingResponseSchema = roomMeetingSchema;
export type CancelRoomMeetingResponse = z.infer<
  typeof cancelRoomMeetingResponseSchema
>;
