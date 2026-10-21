import { z } from 'zod';

import { roomVisibilitySchema } from '../enums.js';
import {
  roomMemberRoleSchema,
  roomMemberStatusSchema,
} from '../enums/rooms.js';
import { offsetPaginatedResponseSchema } from '../common/pagination.js';

export const adminRoomListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  visibility: roomVisibilitySchema,
  archivedAt: z.string().nullable(),
  memberCount: z.number().int(),
  activeReadings: z.number().int(),
  updatedAt: z.string(),
});

export type AdminRoomListItem = z.infer<typeof adminRoomListItemSchema>;

export const adminRoomsResponseSchema = offsetPaginatedResponseSchema(
  adminRoomListItemSchema,
);

export type AdminRoomsResponse = z.infer<typeof adminRoomsResponseSchema>;

export const adminRoomMemberSchema = z.object({
  roomId: z.string(),
  slug: z.string(),
  name: z.string(),
  role: roomMemberRoleSchema,
  status: roomMemberStatusSchema,
  joinedAt: z.string(),
});

export const adminRoomInviteSchema = z.object({
  id: z.string(),
  expiresAt: z.string(),
  allowedEmailCount: z.number().int(),
  maxUses: z.number().int(),
  isRevoked: z.boolean(),
});

export const adminRoomReadingSchema = z.object({
  id: z.string(),
  title: z.string(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
});

export const adminRoomAuditSummaryItemSchema = z.object({
  id: z.string(),
  action: z.string(),
  outcome: z.string(),
  requestId: z.string().nullable(),
  createdAt: z.string(),
});

export const adminRoomDetailResponseSchema = z.object({
  room: adminRoomListItemSchema,
  members: z.array(adminRoomMemberSchema),
  invites: z.array(adminRoomInviteSchema),
  readings: z.array(adminRoomReadingSchema),
  auditSummary: z.array(adminRoomAuditSummaryItemSchema),
});

export type AdminRoomDetailResponse = z.infer<
  typeof adminRoomDetailResponseSchema
>;

export const adminRoomActionResultSchema = z.object({
  message: z.string(),
  archivedAt: z.string().nullable().optional(),
});

export type AdminRoomActionResult = z.infer<typeof adminRoomActionResultSchema>;
