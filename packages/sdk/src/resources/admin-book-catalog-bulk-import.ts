import {
  bookCatalogBulkImportBatchSchema,
  type BookCatalogBulkImportBatch,
  type CreateBookCatalogBulkImportRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type AdminBookCatalogBulkImportResource = {
  createBatch(
    body: CreateBookCatalogBulkImportRequest,
  ): Promise<BookCatalogBulkImportBatch>;
  getBatch(batchId: string): Promise<BookCatalogBulkImportBatch>;
  confirmBatch(
    batchId: string,
    body: { idempotencyKey?: string },
  ): Promise<BookCatalogBulkImportBatch>;
  retryBatch(batchId: string): Promise<BookCatalogBulkImportBatch>;
};

export function createAdminBookCatalogBulkImportResource(
  transport: Transport,
): AdminBookCatalogBulkImportResource {
  return {
    createBatch(body) {
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/import-batches',
        body,
        schema: bookCatalogBulkImportBatchSchema,
      });
    },
    getBatch(batchId) {
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/import-batches/:batchId',
        pathParams: { batchId },
        schema: bookCatalogBulkImportBatchSchema,
      });
    },
    confirmBatch(batchId, body) {
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/import-batches/:batchId/confirm',
        pathParams: { batchId },
        body,
        schema: bookCatalogBulkImportBatchSchema,
      });
    },
    retryBatch(batchId) {
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/import-batches/:batchId/retry',
        pathParams: { batchId },
        body: {},
        schema: bookCatalogBulkImportBatchSchema,
      });
    },
  };
}
