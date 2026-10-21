import {
  createReportRequestSchema,
  reportReceiptSchema,
  type CreateReportRequest,
  type ReportReceipt,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type ReportsResource = {
  create(body: CreateReportRequest): Promise<ReportReceipt>;
};

export function createReportsResource(transport: Transport): ReportsResource {
  return {
    create(body) {
      const parsed = createReportRequestSchema.parse(body);

      return transport.request({
        method: 'POST',
        path: '/reports',
        body: parsed,
        schema: reportReceiptSchema,
      });
    },
  };
}
