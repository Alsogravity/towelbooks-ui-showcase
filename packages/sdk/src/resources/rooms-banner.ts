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

export type RoomsBannerResource = {
  createUploadIntent(
    roomId: string,
    body: CreateBannerUploadIntentRequest,
  ): Promise<BannerUploadIntentResponse>;
  putUpload(
    intent: BannerUploadIntentResponse,
    body: Blob | ArrayBuffer,
  ): Promise<void>;
  completeUpload(
    roomId: string,
    intentToken: string,
  ): Promise<CompleteBannerUploadResponse>;
  clear(roomId: string): Promise<CompleteBannerUploadResponse>;
  upload(
    roomId: string,
    file: Blob,
    meta: {
      contentType: BannerUploadContentType;
      sizeBytes: number;
    },
  ): Promise<CompleteBannerUploadResponse>;
};

export function createRoomsBannerResource(
  transport: Transport,
): RoomsBannerResource {
  return {
    createUploadIntent(roomId, body) {
      return transport.request({
        body: createBannerUploadIntentRequestSchema.parse(body),
        method: 'POST',
        path: '/rooms/:roomId/banner/uploads',
        pathParams: { roomId },
        schema: bannerUploadIntentResponseSchema,
      });
    },
    putUpload(intent, body) {
      return putMediaUpload(transport, intent.upload, body);
    },
    completeUpload(roomId, intentToken) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/banner/uploads/:intentToken/complete',
        pathParams: { roomId, intentToken },
        schema: completeBannerUploadResponseSchema,
      });
    },
    clear(roomId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/banner',
        pathParams: { roomId },
        schema: completeBannerUploadResponseSchema,
      });
    },
    async upload(roomId, file, meta) {
      const intent = await this.createUploadIntent(roomId, {
        contentType: meta.contentType,
        sizeBytes: meta.sizeBytes,
      });

      await this.putUpload(intent, file);

      return this.completeUpload(roomId, intent.uploadIntentToken);
    },
  };
}
