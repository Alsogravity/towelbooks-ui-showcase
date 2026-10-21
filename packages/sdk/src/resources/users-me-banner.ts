import {
  bannerUploadIntentResponseSchema,
  completeBannerUploadResponseSchema,
  createBannerUploadIntentRequestSchema,
  type BannerUploadContentType,
  type BannerUploadIntentResponse,
  type CompleteBannerUploadResponse,
  type CreateBannerUploadIntentRequest,
} from '@towelbooks/schemas';

import { putMediaUpload } from './put-media-upload.js';

import type { Transport } from '../transport.js';

export type UsersMeBannerResource = {
  createUploadIntent(
    body: CreateBannerUploadIntentRequest,
  ): Promise<BannerUploadIntentResponse>;
  putUpload(
    intent: BannerUploadIntentResponse,
    body: Blob | ArrayBuffer,
  ): Promise<void>;
  completeUpload(intentToken: string): Promise<CompleteBannerUploadResponse>;
  clear(): Promise<CompleteBannerUploadResponse>;
  upload(
    file: Blob,
    meta: {
      contentType: BannerUploadContentType;
      sizeBytes: number;
    },
  ): Promise<CompleteBannerUploadResponse>;
};

export function createUsersMeBannerResource(
  transport: Transport,
): UsersMeBannerResource {
  return {
    createUploadIntent(body) {
      return transport.request({
        body: createBannerUploadIntentRequestSchema.parse(body),
        method: 'POST',
        path: '/me/banner/uploads',
        schema: bannerUploadIntentResponseSchema,
      });
    },
    putUpload(intent, body) {
      return putMediaUpload(transport, intent.upload, body);
    },
    completeUpload(intentToken) {
      return transport.request({
        method: 'POST',
        path: `/me/banner/uploads/${encodeURIComponent(intentToken)}/complete`,
        schema: completeBannerUploadResponseSchema,
      });
    },
    clear() {
      return transport.request({
        method: 'DELETE',
        path: '/me/banner',
        schema: completeBannerUploadResponseSchema,
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
