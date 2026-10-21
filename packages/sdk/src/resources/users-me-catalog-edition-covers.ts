import {
  catalogEditionCoverUploadIntentResponseSchema,
  catalogEditionCoverUploadResponseSchema,
  createCatalogEditionCoverUploadIntentRequestSchema,
  type CatalogEditionCoverUploadContentType,
  type CatalogEditionCoverUploadIntentResponse,
  type CatalogEditionCoverUploadResponse,
  type CreateCatalogEditionCoverUploadIntentRequest,
} from '@towelbooks/schemas';

import { putMediaUpload } from './put-media-upload.js';

import type { Transport } from '../transport.js';

export type UsersMeCatalogEditionCoversResource = {
  createUploadIntent(
    body: CreateCatalogEditionCoverUploadIntentRequest,
  ): Promise<CatalogEditionCoverUploadIntentResponse>;
  putUpload(
    intent: CatalogEditionCoverUploadIntentResponse,
    body: Blob | ArrayBuffer,
  ): Promise<void>;
  completeUpload(
    intentToken: string,
  ): Promise<CatalogEditionCoverUploadResponse>;
  upload(
    file: Blob,
    meta: {
      contentType: CatalogEditionCoverUploadContentType;
      sizeBytes: number;
    },
  ): Promise<CatalogEditionCoverUploadResponse>;
};

export function createUsersMeCatalogEditionCoversResource(
  transport: Transport,
): UsersMeCatalogEditionCoversResource {
  return {
    createUploadIntent(body) {
      return transport.request({
        body: createCatalogEditionCoverUploadIntentRequestSchema.parse(body),
        method: 'POST',
        path: '/me/catalog-edition-covers/uploads',
        schema: catalogEditionCoverUploadIntentResponseSchema,
      });
    },
    putUpload(intent, body) {
      return putMediaUpload(transport, intent.upload, body);
    },
    completeUpload(intentToken) {
      return transport.request({
        method: 'POST',
        path: `/me/catalog-edition-covers/uploads/${encodeURIComponent(intentToken)}/complete`,
        schema: catalogEditionCoverUploadResponseSchema,
      });
    },
    async upload(file, meta) {
      const intent = await this.createUploadIntent({
        contentType: meta.contentType,
        sizeBytes: meta.sizeBytes,
      });
      await this.putUpload(intent, file);
      return this.completeUpload(intent.uploadIntentToken);
    },
  };
}
