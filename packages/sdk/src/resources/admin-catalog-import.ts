import {
  bookCatalogImportPreviewResponseSchema,
  bookCatalogImportResponseSchema,
  type BookCatalogImportConfirmRequest,
  type BookCatalogImportPreviewResponse,
  type BookCatalogImportRequest,
  type BookCatalogImportResponse,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

/**
 * Admin grouped book import (epic #693, child #699): the two-phase
 * preview/confirm protocol under `/v1/admin/catalog/book-import-previews`
 * and `/v1/admin/catalog/book-imports`. Both methods are typed by the shared
 * zod schemas, so the preview response carries the taxonomy projection shape
 * the rest of the contract uses.
 */
export type AdminBookCatalogImportResource = {
  createPreview(
    body: BookCatalogImportRequest,
  ): Promise<BookCatalogImportPreviewResponse>;
  getPreview(previewId: string): Promise<BookCatalogImportPreviewResponse>;
  confirm(
    body: BookCatalogImportConfirmRequest,
  ): Promise<BookCatalogImportResponse>;
};

export function createAdminBookCatalogImportResource(
  transport: Transport,
): AdminBookCatalogImportResource {
  return {
    createPreview(body) {
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/book-import-previews',
        body,
        schema: bookCatalogImportPreviewResponseSchema,
      });
    },
    getPreview(previewId) {
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/book-import-previews/:previewId',
        pathParams: { previewId },
        schema: bookCatalogImportPreviewResponseSchema,
      });
    },
    confirm(body) {
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/book-imports',
        body,
        schema: bookCatalogImportResponseSchema,
      });
    },
  };
}
