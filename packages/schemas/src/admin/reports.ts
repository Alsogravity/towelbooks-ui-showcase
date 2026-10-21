import { z } from 'zod';

import { offsetPaginatedResponseSchema } from '../common/pagination.js';
import {
  reportReasonSchema,
  reportStatusSchema,
  reportTargetTypeSchema,
} from '../reports/index.js';

export const adminReportPersonSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().nullable(),
  username: z.string().nullable(),
});

export type AdminReportPerson = z.infer<typeof adminReportPersonSchema>;

export const adminReportTargetSchema = z.object({
  available: z.boolean(),
  id: z.string().uuid(),
  label: z.string(),
  context: z.string().nullable(),
  owner: adminReportPersonSchema.nullable(),
});

export type AdminReportTarget = z.infer<typeof adminReportTargetSchema>;

export const adminReportListItemSchema = z.object({
  id: z.string().uuid(),
  status: reportStatusSchema,
  targetType: reportTargetTypeSchema,
  targetId: z.string().uuid(),
  targetLabel: z.string(),
  reason: reportReasonSchema,
  reporter: adminReportPersonSchema.nullable(),
  createdAt: z.string(),
  reviewedAt: z.string().nullable(),
});

export type AdminReportListItem = z.infer<typeof adminReportListItemSchema>;

export const adminReportsResponseSchema = offsetPaginatedResponseSchema(
  adminReportListItemSchema,
);

export type AdminReportsResponse = z.infer<typeof adminReportsResponseSchema>;

export const adminReportDetailResponseSchema = z.object({
  id: z.string().uuid(),
  status: reportStatusSchema,
  targetType: reportTargetTypeSchema,
  targetId: z.string().uuid(),
  reason: reportReasonSchema,
  details: z.string().nullable(),
  reporter: adminReportPersonSchema.nullable(),
  target: adminReportTargetSchema,
  reviewer: adminReportPersonSchema.nullable(),
  reviewedAt: z.string().nullable(),
  resolutionNote: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdminReportDetailResponse = z.infer<
  typeof adminReportDetailResponseSchema
>;

export const updateAdminReportRequestSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
  resolutionNote: z.string().trim().min(1).max(2_000).optional(),
});

export type UpdateAdminReportRequest = z.infer<
  typeof updateAdminReportRequestSchema
>;
