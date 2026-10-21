import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import { usernameSchema } from '../auth/identity.js';
import {
  roomAccessGrantSourceSchema,
  roomMemberRoleSchema,
  roomMemberStatusSchema,
} from '../enums.js';
import { roomMemberAccessSchema, roomMemberSchema } from './room.js';

export const updateRoomMemberRoleRequestSchema = z
  .object({
    role: roomMemberRoleSchema,
  })
  .strict();
export type UpdateRoomMemberRoleRequest = z.infer<
  typeof updateRoomMemberRoleRequestSchema
>;

export const ROOM_MEMBER_MANAGEMENT_EVENT_TYPES = [
  'manual_access_granted',
  'manual_access_extended',
  'manual_access_revoked',
  'manual_access_restored',
  'invite_access_revoked',
  'invite_access_restored',
  'role_updated',
  'member_suspended',
  'member_unsuspended',
  'member_banned',
  'member_unbanned',
  'invite_accepted',
  'member_removed',
  'ownership_transferred',
] as const;
export type RoomMemberManagementEventType =
  (typeof ROOM_MEMBER_MANAGEMENT_EVENT_TYPES)[number];

export const roomMemberManagementEventTypeSchema = z.enum(
  ROOM_MEMBER_MANAGEMENT_EVENT_TYPES,
);

export const roomMemberManagementEventActorSchema = z.object({
  userId: z.string().min(1).nullable(),
  username: usernameSchema.nullable(),
  displayName: z.string().nullable(),
  avatar: avatarSchema.nullable(),
  kind: z.enum(['user', 'system']),
});
export type RoomMemberManagementEventActor = z.infer<
  typeof roomMemberManagementEventActorSchema
>;

export const roomMemberManagementEventMetadataSchema = z
  .object({
    source: roomAccessGrantSourceSchema.optional(),
    previousRole: roomMemberRoleSchema.optional(),
    newRole: roomMemberRoleSchema.optional(),
    previousExpiresAt: utcDateTimeStringSchema.nullable().optional(),
    newExpiresAt: utcDateTimeStringSchema.nullable().optional(),
  })
  .strict();
export type RoomMemberManagementEventMetadata = z.infer<
  typeof roomMemberManagementEventMetadataSchema
>;

export const roomMemberManagementEventSchema = z.object({
  type: roomMemberManagementEventTypeSchema,
  occurredAt: utcDateTimeStringSchema,
  actor: roomMemberManagementEventActorSchema,
  metadata: roomMemberManagementEventMetadataSchema,
});
export type RoomMemberManagementEvent = z.infer<
  typeof roomMemberManagementEventSchema
>;

export const paginatedRoomMemberManagementHistoryResponseSchema = z.object({
  items: z.array(roomMemberManagementEventSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRoomMemberManagementHistoryResponse = z.infer<
  typeof paginatedRoomMemberManagementHistoryResponseSchema
>;

export const roomMemberManagementAvailableActionsSchema = z.object({
  canChangeRole: z.boolean(),
  canSetManualAccess: z.boolean(),
  canRevokeManualAccess: z.boolean(),
  canRestoreManualAccess: z.boolean(),
  canRevokeInviteAccess: z.boolean(),
  canRestoreInviteAccess: z.boolean(),
  canSuspend: z.boolean(),
  canUnsuspend: z.boolean(),
  canRemove: z.boolean(),
  canBan: z.boolean(),
  assignableRoles: z.array(roomMemberRoleSchema),
  canTransferOwnership: z.boolean(),
});
export type RoomMemberManagementAvailableActions = z.infer<
  typeof roomMemberManagementAvailableActionsSchema
>;

export const roomMemberManualAccessSummarySchema = z.object({
  state: z.enum(['active', 'expired', 'revoked', 'none']),
  startsAt: utcDateTimeStringSchema.nullable(),
  expiresAt: utcDateTimeStringSchema.nullable(),
  revokedAt: utcDateTimeStringSchema.nullable(),
});
export type RoomMemberManualAccessSummary = z.infer<
  typeof roomMemberManualAccessSummarySchema
>;

export const roomMemberParticipationSchema = z.object({
  joinedAt: utcDateTimeStringSchema,
  status: roomMemberStatusSchema,
  role: roomMemberRoleSchema,
  lastActivityAt: utcDateTimeStringSchema.nullable(),
});
export type RoomMemberParticipation = z.infer<
  typeof roomMemberParticipationSchema
>;

export const roomMemberManagementDetailSchema = z.object({
  member: roomMemberSchema,
  participation: roomMemberParticipationSchema,
  access: roomMemberAccessSchema,
  manualAccess: roomMemberManualAccessSummarySchema,
  availableActions: roomMemberManagementAvailableActionsSchema,
});
export type RoomMemberManagementDetail = z.infer<
  typeof roomMemberManagementDetailSchema
>;

export const restoreRoomMemberManualAccessRequestSchema = z
  .object({
    expiresAt: utcDateTimeStringSchema.nullable(),
  })
  .strict();
export type RestoreRoomMemberManualAccessRequest = z.infer<
  typeof restoreRoomMemberManualAccessRequestSchema
>;

export const revokeRoomMemberInviteAccessRequestSchema = z.object({}).strict();
export type RevokeRoomMemberInviteAccessRequest = z.infer<
  typeof revokeRoomMemberInviteAccessRequestSchema
>;

export const restoreRoomMemberInviteAccessRequestSchema = z.object({}).strict();
export type RestoreRoomMemberInviteAccessRequest = z.infer<
  typeof restoreRoomMemberInviteAccessRequestSchema
>;

export const transferRoomOwnershipRequestSchema = z.object({}).strict();
export type TransferRoomOwnershipRequest = z.infer<
  typeof transferRoomOwnershipRequestSchema
>;
