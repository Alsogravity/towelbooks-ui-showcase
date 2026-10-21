import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { usernameSchema } from '../auth/identity.js';
import { avatarSchema } from '../avatars.js';
import {
  roomJoinPolicySchema,
  roomMemberAccessStateSchema,
  roomMemberRoleSchema,
  roomMemberStatusSchema,
  roomRoleCapabilityCodeSchema,
} from '../enums.js';

export const roomViewerEntryBlockedReasonSchema = z.enum([
  'suspended',
  'removed',
]);
export type RoomViewerEntryBlockedReason = z.infer<
  typeof roomViewerEntryBlockedReasonSchema
>;

export const roomViewerEntrySchema = z.object({
  canJoinDirectly: z.boolean(),
  canRequestJoin: z.boolean(),
  hasPendingJoinRequest: z.boolean(),
  canAcceptInvite: z.boolean(),
  blockedReason: roomViewerEntryBlockedReasonSchema.nullable(),
});
export type RoomViewerEntry = z.infer<typeof roomViewerEntrySchema>;

export const roomViewerSchema = z.object({
  role: roomMemberRoleSchema.nullable(),
  membershipStatus: roomMemberStatusSchema.nullable(),
  accessState: roomMemberAccessStateSchema,
  entry: roomViewerEntrySchema,
  capabilities: z.array(roomRoleCapabilityCodeSchema),
});
export type RoomViewer = z.infer<typeof roomViewerSchema>;

export const roomJoinOutcomeSchema = z.enum([
  'joined',
  'reactivated',
  'already_member',
]);
export type RoomJoinOutcome = z.infer<typeof roomJoinOutcomeSchema>;

export const joinRoomResponseSchema = z.object({
  roomId: z.string().min(1),
  outcome: roomJoinOutcomeSchema,
  message: z.string().min(1),
});
export type JoinRoomResponse = z.infer<typeof joinRoomResponseSchema>;

export const roomJoinRequestActorSchema = z.object({
  userId: z.string().min(1),
  username: usernameSchema.nullable(),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
});
export type RoomJoinRequestActor = z.infer<typeof roomJoinRequestActorSchema>;

export const roomJoinRequestSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  requester: roomJoinRequestActorSchema,
  createdAt: utcDateTimeStringSchema,
  requestSeenAt: utcDateTimeStringSchema.nullable(),
});
export type RoomJoinRequest = z.infer<typeof roomJoinRequestSchema>;

export const paginatedRoomJoinRequestsResponseSchema = z.object({
  items: z.array(roomJoinRequestSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRoomJoinRequestsResponse = z.infer<
  typeof paginatedRoomJoinRequestsResponseSchema
>;

export const createRoomJoinRequestResponseSchema = z.object({
  request: roomJoinRequestSchema,
  message: z.string().min(1),
});
export type CreateRoomJoinRequestResponse = z.infer<
  typeof createRoomJoinRequestResponseSchema
>;

export const roomJoinRequestActionResponseSchema = z.object({
  roomId: z.string().min(1),
  outcome: roomJoinOutcomeSchema.optional(),
  message: z.string().min(1),
});
export type RoomJoinRequestActionResponse = z.infer<
  typeof roomJoinRequestActionResponseSchema
>;

export const roomJoinRequestsSummaryPreviewSchema = z.object({
  roomId: z.string().min(1),
  roomName: z.string().min(1),
  pendingCount: z.number().int().nonnegative(),
  unseenCount: z.number().int().nonnegative(),
});
export type RoomJoinRequestsSummaryPreview = z.infer<
  typeof roomJoinRequestsSummaryPreviewSchema
>;

export const roomJoinRequestsSummaryResponseSchema = z.object({
  pendingCount: z.number().int().nonnegative(),
  unseenCount: z.number().int().nonnegative(),
  preview: z.array(roomJoinRequestsSummaryPreviewSchema).max(3),
  snapshotAt: utcDateTimeStringSchema,
});
export type RoomJoinRequestsSummaryResponse = z.infer<
  typeof roomJoinRequestsSummaryResponseSchema
>;

export const markRoomJoinRequestsSeenRequestSchema = z
  .object({
    seenBefore: utcDateTimeStringSchema,
  })
  .strict();
export type MarkRoomJoinRequestsSeenRequest = z.infer<
  typeof markRoomJoinRequestsSeenRequestSchema
>;

export const updateRoomRoleCapabilitiesRequestSchema = z
  .object({
    role: z.literal('moderator'),
    capabilities: z.array(roomRoleCapabilityCodeSchema),
  })
  .strict();
export type UpdateRoomRoleCapabilitiesRequest = z.infer<
  typeof updateRoomRoleCapabilitiesRequestSchema
>;

export const roomRoleCapabilitiesResponseSchema = z.object({
  role: z.literal('moderator'),
  capabilities: z.array(roomRoleCapabilityCodeSchema),
  joinPolicy: roomJoinPolicySchema,
});
export type RoomRoleCapabilitiesResponse = z.infer<
  typeof roomRoleCapabilitiesResponseSchema
>;
