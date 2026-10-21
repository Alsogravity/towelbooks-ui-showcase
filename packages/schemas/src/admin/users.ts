import { z } from 'zod';

import { userStatusSchema } from '../enums.js';
import { roomMemberRoleSchema, roomMemberStatusSchema } from '../enums.js';
import { offsetPaginatedResponseSchema } from '../common/pagination.js';
import { privacyRequestSchema } from '../privacy/preferences.js';

export const adminUserFlagSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export type AdminUserFlag = z.infer<typeof adminUserFlagSchema>;

export const adminUserListItemSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  displayName: z.string().nullable(),
  username: z.string(),
  status: userStatusSchema,
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  flags: z.array(adminUserFlagSchema),
});

export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;

export const adminUsersResponseSchema = offsetPaginatedResponseSchema(
  adminUserListItemSchema,
);

export type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>;

export const adminSessionSummarySchema = z.object({
  id: z.string(),
  expiresAt: z.string(),
  lastSeenAt: z.string().nullable(),
  userAgentFamily: z.string().nullable(),
});

export type AdminSessionSummary = z.infer<typeof adminSessionSummarySchema>;

export const adminRoomMembershipSummarySchema = z.object({
  roomId: z.string(),
  slug: z.string(),
  name: z.string(),
  role: roomMemberRoleSchema,
  status: roomMemberStatusSchema,
  joinedAt: z.string(),
});

export type AdminRoomMembershipSummary = z.infer<
  typeof adminRoomMembershipSummarySchema
>;

export const adminLibrarySummarySchema = z.object({
  ownedLibraries: z.number().int(),
  activeItems: z.number().int(),
  completedItems: z.number().int(),
});

export const adminContentSummarySchema = z
  .object({
    comments: z.number().int(),
    ratings: z.number().int(),
    catalogReviews: z.number().int(),
  })
  .strict();

export const adminPrivacyHistoryItemSchema = privacyRequestSchema.pick({
  id: true,
  type: true,
  status: true,
  requestedAt: true,
  completedAt: true,
});

export const adminAuditSummaryItemSchema = z.object({
  id: z.string(),
  action: z.string(),
  outcome: z.string(),
  requestId: z.string().nullable(),
  createdAt: z.string(),
});

export const adminUserDetailResponseSchema = z.object({
  profile: adminUserListItemSchema,
  recentSessions: z.array(adminSessionSummarySchema),
  roomMemberships: z.array(adminRoomMembershipSummarySchema),
  librarySummary: adminLibrarySummarySchema,
  contentSummary: adminContentSummarySchema,
  privacyHistory: z.array(adminPrivacyHistoryItemSchema),
  auditSummary: z.array(adminAuditSummaryItemSchema),
});

export type AdminUserDetailResponse = z.infer<
  typeof adminUserDetailResponseSchema
>;

export const adminUserActionResultSchema = z.object({
  message: z.string(),
  status: userStatusSchema,
});

export type AdminUserActionResult = z.infer<typeof adminUserActionResultSchema>;
