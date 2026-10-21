import { z } from 'zod';

import { utcDateTimeStringSchema } from '../common/utc-datetime.js';

export const REPORT_DETAILS_MAX_LENGTH = 2_000;
export const REPORT_RESOLUTION_NOTE_MAX_LENGTH = 2_000;

export const reportTargetTypes = [
  'profile',
  'room',
  'catalog_work',
  'comment',
] as const;
export const reportTargetTypeSchema = z.enum(reportTargetTypes);
export type ReportTargetType = z.infer<typeof reportTargetTypeSchema>;

export const reportStatuses = ['open', 'resolved', 'dismissed'] as const;
export const reportStatusSchema = z.enum(reportStatuses);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const reportReasons = [
  'spam',
  'harassment',
  'hateful_content',
  'sexual_or_violent_content',
  'privacy_or_illegal_content',
  'other',
  'impersonation',
  'incorrect_or_misleading_information',
] as const;
export const reportReasonSchema = z.enum(reportReasons);
export type ReportReason = z.infer<typeof reportReasonSchema>;

const commonReportReasons = [
  'spam',
  'harassment',
  'hateful_content',
  'sexual_or_violent_content',
  'privacy_or_illegal_content',
  'other',
] as const satisfies readonly ReportReason[];

export const reportReasonsByTarget = {
  profile: [...commonReportReasons, 'impersonation'],
  room: [...commonReportReasons],
  catalog_work: [...commonReportReasons, 'incorrect_or_misleading_information'],
  comment: [...commonReportReasons],
} as const satisfies Record<ReportTargetType, readonly ReportReason[]>;

export function isReportReasonAllowedForTarget(
  targetType: ReportTargetType,
  reason: ReportReason,
): boolean {
  return (
    reportReasonsByTarget[targetType] as readonly ReportReason[]
  ).includes(reason);
}

const optionalReportTextSchema = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).optional();

export const createReportRequestSchema = z
  .object({
    targetType: reportTargetTypeSchema,
    targetId: z.string().uuid(),
    reason: reportReasonSchema,
    details: optionalReportTextSchema(REPORT_DETAILS_MAX_LENGTH),
  })
  .strict()
  .superRefine((value, context) => {
    if (!isReportReasonAllowedForTarget(value.targetType, value.reason)) {
      context.addIssue({
        code: 'custom',
        message: 'Reason is not available for this report target.',
        path: ['reason'],
      });
    }
  });
export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;

export const reportReceiptSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('open'),
  createdAt: utcDateTimeStringSchema,
});
export type ReportReceipt = z.infer<typeof reportReceiptSchema>;

export const reviewReportRequestSchema = z
  .object({
    status: z.enum(['resolved', 'dismissed']),
    resolutionNote: optionalReportTextSchema(REPORT_RESOLUTION_NOTE_MAX_LENGTH),
  })
  .strict();
export type ReviewReportRequest = z.infer<typeof reviewReportRequestSchema>;
