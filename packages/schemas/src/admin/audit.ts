import { z } from 'zod';

import { offsetPaginatedResponseSchema } from '../common/pagination.js';

export const adminAuditEventSchema = z.object({
  id: z.string(),
  requestId: z.string().nullable(),
  action: z.string(),
  outcome: z.string(),
  actorLabel: z.string().nullable(),
  targetLabel: z.string().nullable(),
  roomLabel: z.string().nullable(),
  createdAt: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type AdminAuditEvent = z.infer<typeof adminAuditEventSchema>;

export const adminAuditResponseSchema = offsetPaginatedResponseSchema(
  adminAuditEventSchema,
);

export type AdminAuditResponse = z.infer<typeof adminAuditResponseSchema>;

export const adminAuditSummarySchema = z.object({
  requestId: z.string(),
  startedAt: z.string(),
  finishedAt: z.string(),
  eventCount: z.number().int(),
});

export const adminAuditDetailResponseSchema = z.object({
  summary: adminAuditSummarySchema,
  events: z.array(adminAuditEventSchema),
});

export type AdminAuditDetailResponse = z.infer<
  typeof adminAuditDetailResponseSchema
>;
