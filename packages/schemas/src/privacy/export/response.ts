import { utcDateTimeStringSchema } from '../../common/utc-datetime.js';
import { z } from 'zod';

import {
  privacyExportAccountSchema,
  privacyExportPrivacySectionSchema,
  privacyExportProfileSchema,
  privacyExportSecurityHistorySchema,
} from './account.js';
import {
  privacyExportRoomSchema,
  privacyExportFollowSchema,
  privacyExportMembershipSchema,
  privacyExportReadingSchema,
  privacyExportRoomJoinRequestSchema,
} from './room-data.js';
import {
  privacyExportActivityEventSchema,
  privacyExportCommentSchema,
  privacyExportDiscussionSchema,
} from './community-data.js';
import {
  privacyExportInviteRedemptionSchema,
  privacyExportInviteSchema,
} from './invites-data.js';
import {
  privacyExportLibraryItemSchema,
  privacyExportLibrarySchema,
  privacyExportCatalogWorkRecordSchema,
  privacyExportCollectionSchema,
} from './library-data.js';
import {
  privacyExportPollResponseSchema,
  privacyExportPollSchema,
} from './polls-data.js';
import {
  privacyExportCatalogReviewSchema,
  privacyExportRatingSchema,
} from './ratings-data.js';
import { privacyExportReportSchema } from './reports-data.js';

export const PRIVACY_EXPORT_SCHEMA_VERSION = '2' as const;

export const privacyExportResponseSchema = z
  .object({
    schemaVersion: z.literal(PRIVACY_EXPORT_SCHEMA_VERSION),
    exportedAt: utcDateTimeStringSchema,
    account: privacyExportAccountSchema,
    profile: privacyExportProfileSchema,
    privacy: privacyExportPrivacySectionSchema,
    securityHistory: privacyExportSecurityHistorySchema,
    libraries: z.array(privacyExportLibrarySchema),
    libraryItems: z.array(privacyExportLibraryItemSchema),
    collections: z.array(privacyExportCollectionSchema),
    catalogWorks: z.array(privacyExportCatalogWorkRecordSchema),
    rooms: z.array(privacyExportRoomSchema),
    memberships: z.array(privacyExportMembershipSchema),
    follows: z.array(privacyExportFollowSchema),
    roomJoinRequests: z.array(privacyExportRoomJoinRequestSchema),
    readings: z.array(privacyExportReadingSchema),
    discussions: z.array(privacyExportDiscussionSchema),
    polls: z.array(privacyExportPollSchema),
    pollResponses: z.array(privacyExportPollResponseSchema),
    activityEvents: z.array(privacyExportActivityEventSchema),
    comments: z.array(privacyExportCommentSchema),
    ratings: z.array(privacyExportRatingSchema),
    catalogReviews: z.array(privacyExportCatalogReviewSchema),
    reports: z.array(privacyExportReportSchema),
    invites: z.array(privacyExportInviteSchema),
    inviteRedemptions: z.array(privacyExportInviteRedemptionSchema),
  })
  .strict();
export type PrivacyExportResponse = z.infer<typeof privacyExportResponseSchema>;
