import { z } from 'zod';

import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { createCursorPaginatedResponseSchema } from '../pagination.js';

import {
  profileFollowAccessStatusSchema,
  publicProfileListItemSchema,
} from './profile.js';

export const incomingFollowRequestUserFollowsViewerSchema = z.enum([
  'requested',
  'active',
]);
export type IncomingFollowRequestUserFollowsViewer = z.infer<
  typeof incomingFollowRequestUserFollowsViewerSchema
>;

export const incomingFollowRequestViewerRelationshipSchema = z.object({
  userFollowsViewer: incomingFollowRequestUserFollowsViewerSchema,
  viewerFollowsUser: profileFollowAccessStatusSchema,
});
export type IncomingFollowRequestViewerRelationship = z.infer<
  typeof incomingFollowRequestViewerRelationshipSchema
>;

export const incomingFollowRequestItemSchema = z.object({
  createdAt: utcDateTimeStringSchema,
  id: z.string().min(1),
  requester: publicProfileListItemSchema,
  viewerRelationship: incomingFollowRequestViewerRelationshipSchema,
});
export type IncomingFollowRequestItem = z.infer<
  typeof incomingFollowRequestItemSchema
>;

export const incomingFollowRequestsQuerySchema = z.object({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
export type IncomingFollowRequestsQuery = z.infer<
  typeof incomingFollowRequestsQuerySchema
>;

export const incomingFollowRequestsResponseSchema =
  createCursorPaginatedResponseSchema(incomingFollowRequestItemSchema);
export type IncomingFollowRequestsResponse = z.infer<
  typeof incomingFollowRequestsResponseSchema
>;

export const incomingFollowRequestsSummaryResponseSchema = z.object({
  pendingCount: z.number().int().min(0),
  preview: z.array(publicProfileListItemSchema).max(2),
  snapshotAt: utcDateTimeStringSchema,
  unseenCount: z.number().int().min(0),
});
export type IncomingFollowRequestsSummaryResponse = z.infer<
  typeof incomingFollowRequestsSummaryResponseSchema
>;

export const markIncomingFollowRequestsSeenRequestSchema = z.object({
  seenBefore: utcDateTimeStringSchema,
});
export type MarkIncomingFollowRequestsSeenRequest = z.infer<
  typeof markIncomingFollowRequestsSeenRequestSchema
>;
