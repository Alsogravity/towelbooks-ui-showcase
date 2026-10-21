import { utcDateTimeStringSchema } from '../../common/utc-datetime.js';
import { z } from 'zod';

import { usernameSchema } from '../../auth.js';
import {
  roomMemberRoleSchema,
  roomMemberStatusSchema,
  roomJoinPolicySchema,
  roomVisibilitySchema,
} from '../../enums.js';

import { privacyExportCatalogWorkSchema } from './library-data.js';

export const privacyExportRoomLinkSchema = z
  .object({
    title: z.string(),
    url: z.string(),
    position: z.number().int().nonnegative(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportRoomLink = z.infer<typeof privacyExportRoomLinkSchema>;

export const privacyExportRoomSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    visibility: roomVisibilitySchema,
    joinPolicy: roomJoinPolicySchema,
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    archivedAt: utcDateTimeStringSchema.nullable(),
    links: z.array(privacyExportRoomLinkSchema),
  })
  .strict();
export type PrivacyExportRoom = z.infer<typeof privacyExportRoomSchema>;

export const privacyExportMembershipSchema = z
  .object({
    bannedAt: utcDateTimeStringSchema.nullable(),
    id: z.string().min(1),
    roomId: z.string().min(1),
    roomSlug: z.string().min(1),
    roomName: z.string().min(1),
    role: roomMemberRoleSchema,
    status: roomMemberStatusSchema,
    joinedAt: utcDateTimeStringSchema,
    removedAt: utcDateTimeStringSchema.nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportMembership = z.infer<
  typeof privacyExportMembershipSchema
>;

export const privacyExportRelatedUserSchema = z
  .object({
    id: z.string().min(1),
    username: usernameSchema.nullable(),
    displayName: z.string().nullable(),
  })
  .strict();
export type PrivacyExportRelatedUser = z.infer<
  typeof privacyExportRelatedUserSchema
>;

export const privacyExportFollowSchema = z
  .object({
    id: z.string().min(1),
    direction: z.enum(['follower', 'following']),
    status: z.string().min(1),
    acceptedAt: utcDateTimeStringSchema.nullable(),
    createdAt: utcDateTimeStringSchema,
    requestSeenAt: utcDateTimeStringSchema.nullable(),
    otherUser: privacyExportRelatedUserSchema,
  })
  .strict();
export type PrivacyExportFollow = z.infer<typeof privacyExportFollowSchema>;

export const privacyExportRoomJoinRequestSchema = z
  .object({
    id: z.string().min(1),
    direction: z.enum(['outgoing', 'incoming']),
    roomId: z.string().min(1),
    roomSlug: z.string().min(1),
    roomName: z.string().min(1),
    createdAt: utcDateTimeStringSchema,
    requestSeenAt: utcDateTimeStringSchema.nullable(),
    requester: privacyExportRelatedUserSchema.optional(),
  })
  .strict();
export type PrivacyExportRoomJoinRequest = z.infer<
  typeof privacyExportRoomJoinRequestSchema
>;

export const privacyExportReadingSchema = z
  .object({
    id: z.string().min(1),
    roomId: z.string().min(1),
    roomSlug: z.string().min(1),
    roomName: z.string().min(1),
    description: z.string().nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    catalogWork: privacyExportCatalogWorkSchema,
  })
  .strict();
export type PrivacyExportReading = z.infer<typeof privacyExportReadingSchema>;
