import { z } from 'zod';

import { utcDateTimeStringSchema } from '../../common/utc-datetime.js';
import {
  REPORT_DETAILS_MAX_LENGTH,
  reportReasonSchema,
  reportStatusSchema,
  reportTargetTypeSchema,
} from '../../reports/index.js';

export const privacyExportReportSchema = z
  .object({
    id: z.string().uuid(),
    targetType: reportTargetTypeSchema,
    targetId: z.string().uuid(),
    reason: reportReasonSchema,
    details: z.string().max(REPORT_DETAILS_MAX_LENGTH).nullable(),
    status: reportStatusSchema,
    reviewedAt: utcDateTimeStringSchema.nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportReport = z.infer<typeof privacyExportReportSchema>;
