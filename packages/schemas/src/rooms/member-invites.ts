import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { usernameSchema } from '../auth/identity.js';
import { avatarSchema } from '../avatars.js';
import { EMAIL_MAX_LENGTH } from '../limits.js';
import { roomJoinOutcomeSchema } from './join.js';

/** Default TTL for a directed room member invite. */
export const ROOM_MEMBER_INVITE_DEFAULT_EXPIRES_IN_HOURS = 72;

/** Maximum pending directed invites per room. */
export const ROOM_MEMBER_INVITES_PER_ROOM_MAX = 50;

/** Maximum pending directed invites a single manager may create in one room. */
export const ROOM_MEMBER_INVITES_PER_CREATOR_PER_ROOM_MAX = 20;

/** Maximum pending directed invites a single invitee may hold globally. */
export const ROOM_MEMBER_INVITES_PER_INVITEE_MAX = 20;

export const createRoomMemberInviteRequestSchema = z
  .object({
    identifier: z.string().trim().min(1).max(EMAIL_MAX_LENGTH),
  })
  .strict();
export type CreateRoomMemberInviteRequest = z.infer<
  typeof createRoomMemberInviteRequestSchema
>;

export const roomMemberInviteActorSchema = z.object({
  userId: z.string().min(1),
  username: usernameSchema.nullable(),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
});
export type RoomMemberInviteActor = z.infer<typeof roomMemberInviteActorSchema>;

export const roomMemberInviteSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  invitee: roomMemberInviteActorSchema,
  invitedBy: roomMemberInviteActorSchema,
  createdAt: utcDateTimeStringSchema,
  expiresAt: utcDateTimeStringSchema,
});
export type RoomMemberInvite = z.infer<typeof roomMemberInviteSchema>;

export const paginatedRoomMemberInvitesResponseSchema = z.object({
  items: z.array(roomMemberInviteSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRoomMemberInvitesResponse = z.infer<
  typeof paginatedRoomMemberInvitesResponseSchema
>;

export const createRoomMemberInviteResponseSchema = z.object({
  invite: roomMemberInviteSchema,
  message: z.string().min(1),
});
export type CreateRoomMemberInviteResponse = z.infer<
  typeof createRoomMemberInviteResponseSchema
>;

export const revokeRoomMemberInviteResponseSchema = z.object({
  message: z.string().min(1),
});
export type RevokeRoomMemberInviteResponse = z.infer<
  typeof revokeRoomMemberInviteResponseSchema
>;

export const incomingRoomMemberInviteSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  roomName: z.string().min(1),
  invitedBy: roomMemberInviteActorSchema,
  createdAt: utcDateTimeStringSchema,
  expiresAt: utcDateTimeStringSchema,
  inviteSeenAt: utcDateTimeStringSchema.nullable(),
});
export type IncomingRoomMemberInvite = z.infer<
  typeof incomingRoomMemberInviteSchema
>;

export const paginatedIncomingRoomMemberInvitesResponseSchema = z.object({
  items: z.array(incomingRoomMemberInviteSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedIncomingRoomMemberInvitesResponse = z.infer<
  typeof paginatedIncomingRoomMemberInvitesResponseSchema
>;

export const roomMemberInvitesSummaryPreviewSchema = z.object({
  roomId: z.string().min(1),
  roomName: z.string().min(1),
  pendingCount: z.number().int().nonnegative(),
  unseenCount: z.number().int().nonnegative(),
});
export type RoomMemberInvitesSummaryPreview = z.infer<
  typeof roomMemberInvitesSummaryPreviewSchema
>;

export const roomMemberInvitesSummaryResponseSchema = z.object({
  pendingCount: z.number().int().nonnegative(),
  unseenCount: z.number().int().nonnegative(),
  preview: z.array(roomMemberInvitesSummaryPreviewSchema).max(3),
  snapshotAt: utcDateTimeStringSchema,
});
export type RoomMemberInvitesSummaryResponse = z.infer<
  typeof roomMemberInvitesSummaryResponseSchema
>;

export const markRoomMemberInvitesSeenRequestSchema = z
  .object({
    seenBefore: utcDateTimeStringSchema,
  })
  .strict();
export type MarkRoomMemberInvitesSeenRequest = z.infer<
  typeof markRoomMemberInvitesSeenRequestSchema
>;

export const roomMemberInviteActionResponseSchema = z.object({
  roomId: z.string().min(1),
  outcome: roomJoinOutcomeSchema.optional(),
  message: z.string().min(1),
});
export type RoomMemberInviteActionResponse = z.infer<
  typeof roomMemberInviteActionResponseSchema
>;
